'use client';

import { ChevronDown, ChevronUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import NextImage from 'next/image';

import { getCollection } from '@/lib/typesense/actions/collections';
import { multiSearch } from '@/lib/typesense/actions/documents';

import { useDebounce } from '@/hooks/useDebounce';
import { useQueryParams } from '@/hooks/useQueryParams';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface FacetValue {
  value: string;
  count: number;
}

interface SearchResult {
  id: string;
  [key: string]: any; // To accommodate dynamic fields
}

interface TypesenseSearchProps {
  collectionName: string;
}

interface FilterProps {
  facetValues: Record<string, FacetValue[]>;
  filterBy: string[];
  onFilterChange: (value: string, checked: boolean) => void;
}

// Reusable Filter Component
const Filter: React.FC<FilterProps> = ({
  facetValues,
  filterBy,
  onFilterChange,
}) => {
  const [expandedFields, setExpandedFields] = useState<Record<string, boolean>>(
    {},
  );

  const toggleExpand = (field: string) => {
    setExpandedFields((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <>
      {Object.entries(facetValues).map(([field, values]) => (
        <div key={field} className="border-b last:border-b-0 py-4">
          <span className="font-medium py-4">
            {field.charAt(0).toUpperCase() + field.slice(1)}
          </span>

          <div className="py-4 space-y-2">
            {values.map((facet) => (
              <div key={facet.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`${field}-${facet.value}`}
                  checked={filterBy.includes(`${field}:${facet.value}`)}
                  onCheckedChange={(checked) =>
                    onFilterChange(
                      `${field}:${facet.value}`,
                      checked as boolean,
                    )
                  }
                />
                <label
                  htmlFor={`${field}-${facet.value}`}
                  className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex-grow"
                >
                  {facet.value}
                </label>
                <span className="text-xs text-muted-foreground">
                  {facet.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </>
  );
};

export default function TypesenseSearch({
  collectionName,
}: TypesenseSearchProps) {
  const [queryParams, setQueryParams] = useQueryParams();
  const [searchQuery, setSearchQuery] = useState<string>(queryParams.q || '');
  const [perPage, setPerPage] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(
    parseInt(queryParams.page || '1'),
  );
  const [sortBy, setSortBy] = useState<string>(
    queryParams.sort_by ?? 'relevance',
  );
  const [filterBy, setFilterBy] = useState<string[]>(
    queryParams.filter_by?.split(',') || [],
  );
  const [facetValues, setFacetValues] = useState<Record<string, FacetValue[]>>(
    {},
  );
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalResults, setTotalResults] = useState<number>(0);

  const [indexFields, setIndexFields] = useState<string[]>([]);
  const [facetFields, setFacetFields] = useState<string[]>([]);
  const [sortFields, setSortFields] = useState<string[]>([]);

  const debouncedSearchQuery = useDebounce<string>(searchQuery, 300);

  const [sortDropdownOptions, setSortDropdownOptions] = useState<
    { label: string; value: string }[]
  >([]);

  const [countDropdownOptions, setCountDropdownOptions] = useState<
    { label: string; value: number }[]
  >([]);

  // Fetch Schema for Collection
  useEffect(() => {
    const fetchSchema = async () => {
      try {
        const schemaResponse = await getCollection(collectionName);

        // Get fields that are marked as facet
        const facets =
          schemaResponse?.fields
            ?.filter((field) => field.facet === true)
            .map((field) => field.name) || [];
        const indexFields =
          schemaResponse?.fields
            ?.filter(
              (field) =>
                field.index === true &&
                (field.type === 'string' || field.type === 'string[]'),
            )
            .map((field) => field.name) || [];

        const sortFields =
          schemaResponse?.fields
            ?.filter((field) => field.sort === true)
            .map((field) => field.name) || [];

        setFacetFields(facetFields);
        setIndexFields(indexFields);
        setSortFields(sortFields);

        setSortDropdownOptions(
          sortFields.flatMap((field) => {
            const words = field
              .replace(/([A-Z])/g, ' $1')
              .trim()
              .split(' ');
            const capitalizedWords = words.map(
              (word) => word.charAt(0).toUpperCase() + word.slice(1),
            );
            const label = capitalizedWords.join(' ');
            return [
              {
                label: `${label} (Asc)`,
                value: `${field}:asc`,
              },
              {
                label: `${label} (Desc)`,
                value: `${field}:desc`,
              },
            ];
          }),
        );

        setSortBy(sortDropdownOptions[0].value);
      } catch (error) {
        console.error('Error fetching schema:', error);
      }
    };
    fetchSchema();

    setCountDropdownOptions([
      { label: '10', value: 10 },
      { label: '20', value: 20 },
      { label: '50', value: 50 },
      { label: '100', value: 100 },
      { label: '200', value: 200 },
    ]);
  }, [collectionName]);

  // Perform search whenever query parameters change
  useEffect(() => {
    const params: Record<string, string> = {};
    if (debouncedSearchQuery) params.q = debouncedSearchQuery;
    if (currentPage > 1) params.page = currentPage.toString();
    if (sortBy && sortBy !== 'relevance') params.sort_by = sortBy;
    if (filterBy.length > 0) params.filter_by = filterBy.join(',');

    setQueryParams(params);
    performMultiSearch();
  }, [
    debouncedSearchQuery,
    currentPage,
    sortBy,
    filterBy,
    facetFields,
    indexFields,
    sortFields,
  ]);

  // Perform search and handle results
  const performMultiSearch = async () => {
    setLoading(true);

    // Build filter_by string from selected filters
    const filterString = filterBy.join(' && ');

    // Build the multi-search query dynamically using schema fields
    const queries = [
      {
        collection: collectionName,
        q: queryParams.q ?? '*',
        queryBy: indexFields.join(','), // dynamic index fields
        highlightFullFields: indexFields.join(','),
        page: parseInt(queryParams.page ?? '1'),
        perPage,
        facetBy: facetFields.join(','), // dynamic facet fields
        exhaustiveSearch: true,
        sortBy: queryParams?.sort_by ?? '',
        filterBy: filterBy.join(','), // dynamic filters
        maxFacetValues: 10,
      },
    ];

    try {
      const response = await multiSearch({
        searchQueries: queries,
      });

      if (response && response.results.length > 0) {
        const [documentsResponse] = response.results;
        setSearchResults(documentsResponse.hits.map((hit) => hit.document));
        setTotalResults(documentsResponse.found);
        setTotalPages(Math.ceil(documentsResponse.found / perPage));

        // Dynamically update facet values
        setFacetValues(
          documentsResponse.facet_counts.reduce((acc, facet) => {
            acc[facet.field_name] = facet.counts.map((count) => ({
              value: count.value,
              count: count.count,
            }));
            return acc;
          }, {}),
        );
      } else {
        setSearchResults([]);
        setTotalResults(0);
        setTotalPages(1);
        setFacetValues({});
      }
    } catch (error) {
      console.error('Error performing multi-search:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle search form submit
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    performMultiSearch();
  };

  const isValidUrl = (string: string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const isImageUrl = (url: string) => {
    return /\.(jpg|jpeg|png|webp|avif|gif|svg)$/.test(url);
  };

  const ResultField = ({ field, value }: { field: string; value: any }) => {
    if (typeof value === 'string') {
      if (isValidUrl(value)) {
        if (isImageUrl(value)) {
          return (
            <div>
              <span className="font-medium">{field}: </span>
              <NextImage
                src={value}
                alt={field}
                width={200}
                height={200}
                className="mt-2 rounded-md"
              />
            </div>
          );
        } else {
          return (
            <div>
              <span className="font-medium">{field}: </span>
              <Link
                href={value}
                target="_blank"
                className="text-blue-500 hover:underline"
              >
                {value} <ExternalLink className="inline-block w-4 h-4" />
              </Link>
            </div>
          );
        }
      } else {
        return (
          <div>
            <span className="font-medium">{field}: </span>
            <span dangerouslySetInnerHTML={{ __html: value }} />
          </div>
        );
      }
    } else if (Array.isArray(value)) {
      return (
        <div>
          <span className="font-medium">{field}: </span>
          <ul className="list-disc list-inside">
            {value.map((item, index) => (
              <li key={index}>{JSON.stringify(item)}</li>
            ))}
          </ul>
        </div>
      );
    } else if (typeof value === 'object' && value !== null) {
      return (
        <div>
          <span className="font-medium">{field}: </span>
          <pre className="text-sm bg-gray-100 p-2 rounded-md overflow-x-auto">
            {JSON.stringify(value, null, 2)}
          </pre>
        </div>
      );
    } else {
      return (
        <div>
          <span className="font-medium">{field}: </span>
          {JSON.stringify(value)}
        </div>
      );
    }
  };

  // Handle filter changes
  const handleFilterChange = (value: string, checked: boolean) => {
    setFilterBy((prev) =>
      checked
        ? [...prev, filterExpression]
        : prev.filter((item) => item !== filterExpression),
    );
    setCurrentPage(1);
  };

  return (
    <div className="container mx-auto py-12 px-6 flex flex-col gap-y-4">
      <h1 className="text-3xl font-bold mb-6">Search Documents</h1>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-4">
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Enter your search query"
            className="flex-grow"
          />
          <Button type="submit">Search</Button>
        </div>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <div className="md:col-span-1">
          <Filter
            facetValues={facetValues}
            filterBy={filterBy}
            onFilterChange={handleFilterChange}
          />
        </div>

        {/* Search Results Section */}
        <div className="md:col-span-3">
          <div className="flex justify-end items-center mb-4 gap-x-4">
            <Select
              value={perPage.toString()}
              onValueChange={(value) => setPerPage(parseInt(value))}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue>Results per page</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {countDropdownOptions.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value.toString()}
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue>Sort by</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {sortDropdownOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Search Results Section */}
          <div className="flex justify-between items-center mb-4">
            <p>{loading ? 'Searching...' : `${totalResults} results found`}</p>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                {sortDropdownOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {searchResults.map((result, index) => (
            <Card key={result.id} className="mb-4">
              <CardHeader>
                <CardTitle>Result {index + 1}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2">
                  {Object.entries(result).map(([key, value]) => (
                    <ResultField key={key} field={key} value={value} />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
