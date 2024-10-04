'use client';

import { useEffect, useState } from 'react';

import { getCollection } from '@/lib/typesense/actions/collections';
import { multiSearch } from '@/lib/typesense/actions/documents';

import { useDebounce } from '@/hooks/useDebounce';
import { useQueryParams } from '@/hooks/useQueryParams';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Pagination } from '@/components/ui/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CloudCog } from 'lucide-react';

interface FacetValue {
  value: string;
  count: number;
}
interface MultiSearchResponse {
  results: Array<{
    hits: Array<{ document: SearchResult }>;
    found: number;
    facet_counts?: Record<string, FacetValue[]>;
  }>;
}

interface SearchResult {
  id: string;
  title: string;
  content: string;
}

interface TypesenseSearchProps {
  collectionName: string;
}

export default function TypesenseSearch({
  collectionName,
}: TypesenseSearchProps) {
  const [queryParams, setQueryParams] = useQueryParams();
  const [searchQuery, setSearchQuery] = useState<string>(queryParams.q || '');
  const [currentPage, setCurrentPage] = useState<number>(
    parseInt(queryParams.page || '1'),
  );
  const [sortBy, setSortBy] = useState<string>(
    queryParams.sort_by || 'relevance',
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
  const [schemaFields, setSchemaFields] = useState<string[]>([]);
  const [facetFields, setFacetFields] = useState<string[]>([]);

  const debouncedSearchQuery = useDebounce<string>(searchQuery, 300);
  const perPage = 10;

  // Fetch schema on mount to initialize facets and filters
  useEffect(() => {
    const fetchSchema = async () => {
      try {
        const schemaResponse = await getCollection(collectionName);
        const fields = schemaResponse?.fields?.map((field) => field.name) || [];

        const facetFields =
          schemaResponse?.fields
            ?.filter((field) => field.facet === true)
            .map((field) => field.name) || [];

        setFacetFields(facetFields);
        setSchemaFields(fields);
        const facetFields = fields.filter((field: string) => schemaResponse?.fields?.find((f: any) => f.name === field)?.facet === true);
        setFacetFields(facetFields);
      } catch (error) {
        console.error('Error fetching schema:', error);
      }
    };
    fetchSchema();
  }, [collectionName]);

  // Sync state changes to URL and perform search
  useEffect(() => {
    const params: Record<string, string> = {};
    if (debouncedSearchQuery) params.q = debouncedSearchQuery;
    if (currentPage > 1) params.page = currentPage.toString();
    if (sortBy !== 'relevance') params.sort_by = sortBy;
    if (filterBy.length > 0) params.filter_by = filterBy.join(',');

    setQueryParams(params);
    performMultiSearch();
  }, [debouncedSearchQuery, currentPage, sortBy, filterBy]);

  // Perform multi-search with updated parameters
  const performMultiSearch = async () => {
    setLoading(true);
    const queries = [
      {
        collection: collectionName,
        q: "debouncedSearchQuery" || '*',
        query_by: schemaFields.join(','),
        page: currentPage,
        per_page: perPage,
        facet_by: facetFields.join(','), // Facet by all schema 
        exhaustive_search: true,
      },
    ];

    try {
      const response = await multiSearch(queries);
      
      if (response && response.results.length > 0) {
        const [documentsResponse] = response.results;
        console.log(documentsResponse);
        // Update search results
        setSearchResults(documentsResponse?.hits.map((hit) => hit.document));
        setTotalResults(documentsResponse?.found);
        setTotalPages(Math.ceil(documentsResponse?.found / perPage));

        // Update facet values
        setFacetValues(documentsResponse.facet_counts || {});
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    performMultiSearch();
  };

  const handleFilterChange = (value: string, checked: boolean) => {
    setFilterBy((prev) =>
      checked ? [...prev, value] : prev.filter((item) => item !== value),
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
          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent>
              {Object.keys(facetValues).map((field) => (
                <div key={field} className="mb-4">
                  <Label>
                    {field.charAt(0).toUpperCase() + field.slice(1)}
                  </Label>
                  {facetValues[field]?.map((facet) => (
                    <div
                      key={facet.value}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={facet.value}
                        checked={filterBy.includes(`${field}:${facet.value}`)}
                        onCheckedChange={(checked) =>
                          handleFilterChange(
                            `${field}:${facet.value}`,
                            checked as boolean,
                          )
                        }
                      />
                      <label
                        htmlFor={facet.value}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {facet.value} ({facet.count})
                      </label>
                    </div>
                  ))}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Search Results Section */}
        <div className="md:col-span-3">
          <div className="flex justify-between items-center mb-4">
            <p>{loading ? 'Searching...' : `${totalResults} results found`}</p>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Relevance</SelectItem>
                <SelectItem value="title:asc">Title (A-Z)</SelectItem>
                <SelectItem value="title:desc">Title (Z-A)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {searchResults.map((result: any) => (
            <Card key={result.id} className="mb-4">
              <CardHeader>
                <CardTitle dangerouslySetInnerHTML={{ __html: result.title }} />
              </CardHeader>
              <CardContent>
                <p dangerouslySetInnerHTML={{ __html: result.content }} />
              </CardContent>
            </Card>
          ))}

          {/* Pagination Component */}
          {/* <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} /> */}
        </div>
      </div>
    </div>
  );
}
