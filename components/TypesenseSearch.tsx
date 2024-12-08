'use client';

import { Loader2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';

import { getCollection } from '@/lib/typesense/collections';
import { multiSearch } from '@/lib/typesense/documents';

import { useDebounce } from '@/hooks/useDebounce';
import { useQueryParams } from '@/hooks/useQueryParams';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import DocumentCard from '@/components/DocumentCard';
import PaginationComponent from '@/components/Pagination';
import Filter from '@/components/SearchFilters';

interface FacetValue {
  value: string;
  count: number;
}

interface SearchResult {
  id: string;
  title: string;
  content: string;
}

interface TypesenseSearchProps {
  collectionName: string;
  searchParams: { [key: string]: string | string[] | undefined };
}

export default function TypesenseSearch({
  collectionName,
  searchParams,
}: Readonly<TypesenseSearchProps>) {
  const [queryParams, setQueryParams] = useQueryParams();

  const [collectionSchema, setCollectionSchema] = useState<any>(null);
  const [indexFields, setIndexFields] = useState<string[]>([]);
  const [facetFields, setFacetFields] = useState<string[]>([]);
  const [sortFields, setSortFields] = useState<string[]>([]);

  const [perPage, setPerPage] = useState<number>(
    parseInt(queryParams.perPage ?? '12'),
  );
  const [currentPage, setCurrentPage] = useState<number>(
    parseInt(queryParams.page ?? '1'),
  );
  const [sortBy, setSortBy] = useState<string>(
    queryParams.sortBy ?? 'relevance',
  );
  const [filterBy, setFilterBy] = useState<string[]>(
    queryParams.filter_by?.split(',') ?? [],
  );
  const [facetValues, setFacetValues] = useState<Record<string, FacetValue[]>>(
    {},
  );

  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [loadingDocuments, setLoadingDocuments] = useState<boolean>(true);
  const [loadingFilters, setLoadingFilters] = useState<boolean>(true);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalResults, setTotalResults] = useState<number>(0);

  const debouncedSearchQuery = useDebounce<string>(queryParams.q ?? '', 300);

  const [sortDropdownOptions, setSortDropdownOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const [countDropdownOptions, setCountDropdownOptions] = useState<
    { label: string; value: number }[]
  >([]);

  const performMultiSearch = async () => {
    setLoadingDocuments(true);
    const queries = [
      {
        collection: collectionName,
        q: queryParams.q ?? '*',
        queryBy: indexFields.join(','),
        highlightFullFields: indexFields.join(','),
        page: currentPage,
        perPage,
        exhaustiveSearch: true,
        sortBy: queryParams?.sort_by ?? '',
        filterBy: filterBy.join(','),
      },
    ];

    try {
      const response = await multiSearch({
        searchQueries: queries,
      });

      if (response && response.results && response.results.length > 0) {
        const [documentsResponse] = response.results;
        type SearchHit = {
          document: any;
        };
        type SearchResponse = {
          hits?: SearchHit[];
          found?: number;
        };
        const typedResponse = documentsResponse as SearchResponse;

        setSearchResults(typedResponse.hits?.map((hit) => hit.document) ?? []);
        setTotalResults(typedResponse.found ?? 0);
        const totalPages = Math.ceil((typedResponse.found ?? 0) / perPage);
        setTotalPages(totalPages);
      } else {
        setSearchResults([]);
        setTotalResults(0);
        setTotalPages(1);
      }
    } catch (error) {
      console.error('Error performing multi-search:', error);
    } finally {
      setLoadingDocuments(false);
    }
  };

  useEffect(() => {
    const fetchFacets = async () => {
      setLoadingFilters(true);
      try {
        const queries = [
          {
            collection: collectionName,
            q: '*',
            facetBy: facetFields.join(','),
            maxFacetValues: 10,
            perPage: 0,
          },
        ];

        const response = await multiSearch({
          searchQueries: queries,
        });

        if (response && response.results && response.results.length > 0) {
          const [documentsResponse] = response.results;
          type FacetCount = {
            field_name: string;
            counts: Array<{
              value: string;
              count: number;
            }>;
          };
          type SearchResponseWithFacets = {
            facet_counts?: FacetCount[];
          };
          const typedResponse = documentsResponse as SearchResponseWithFacets;
          setFacetValues(
            typedResponse.facet_counts?.reduce(
              (acc: Record<string, FacetValue[]>, facet: FacetCount) => {
                acc[facet.field_name] =
                  facet.counts?.map((count) => ({
                    value: count.value,
                    count: count.count,
                  })) ?? [];
                return acc;
              },
              {} as Record<string, FacetValue[]>,
            ) ?? {},
          );
        }
      } catch (error) {
        console.error('Error fetching facet values:', error);
      } finally {
        setLoadingFilters(false);
      }
    };

    if (facetFields.length > 0) {
      fetchFacets();
    }
  }, [facetFields, collectionName]);

  useEffect(() => {
    const fetchSchema = async () => {
      try {
        const schemaResponse = await getCollection(collectionName);

        const facetFields =
          schemaResponse?.fields
            ?.filter((field) => field.facet === true)
            .map((field) => field.name) ?? [];
        const indexFields =
          schemaResponse?.fields
            ?.filter(
              (field) =>
                field.index === true &&
                (field.type === 'string' || field.type === 'string[]'),
            )
            .map((field) => field.name) ?? [];

        const sortFields =
          schemaResponse?.fields
            ?.filter((field) => field.sort === true)
            .map((field) => field.name) ?? [];

        setCollectionSchema(schemaResponse);
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
                label: `${label} (Ascending)`,
                value: `${field}:asc`,
              },
              {
                label: `${label} (Descending)`,
                value: `${field}:desc`,
              },
            ];
          }),
        );
      } catch (error) {
        console.error('Error fetching schema:', error);
      }
    };
    fetchSchema();

    setCountDropdownOptions([
      { label: '12', value: 12 },
      { label: '24', value: 24 },
      { label: '48', value: 48 },
      { label: '96', value: 96 },
      { label: '192', value: 192 },
    ]);
  }, [collectionName]);

  useEffect(() => {
    const params: Record<string, string> = {};
    if (debouncedSearchQuery) params.q = debouncedSearchQuery;
    if (currentPage > 1) params.page = currentPage.toString();
    if (sortBy !== 'relevance') params.sort_by = sortBy;
    if (filterBy.length > 0) params.filter_by = filterBy.join(',');

    setQueryParams(params);
    performMultiSearch();
  }, [
    debouncedSearchQuery,
    currentPage,
    sortBy,
    filterBy,
    indexFields,
    sortFields,
  ]);

  const handleFilterChange = (
    field: string,
    value: string,
    checked: boolean,
  ) => {
    const filterString = `${field}:=${value}`;
    setFilterBy((prev) =>
      checked
        ? [...prev, filterString]
        : prev.filter((item) => item !== filterString),
    );
    setCurrentPage(1);
  };

  const handlePerPageChange = (value: number) => {
    setQueryParams({ ...queryParams, perPage: value.toString() });
    setPerPage(value);
    setQueryParams({ ...queryParams, page: '1' });
    setCurrentPage(1);
  };

  const handleSortByChange = (value: string) => {
    setQueryParams({ ...queryParams, sortBy: value });
    setSortBy(value);
    setCurrentPage(1);
  };

  return (
    <div className="container mx-auto p-8 flex flex-col gap-y-4">
      <Card className="border-none shadow-none">
        <CardHeader>
          <CardTitle className="">Search Documents</CardTitle>
          <CardDescription>
            Search for documents in the {collectionName} collection.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingDocuments || loadingFilters ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-12">
              <div className="col-span-1">
                <Filter
                  collectionSchema={collectionSchema}
                  facetValues={facetValues}
                  filterBy={Object.fromEntries(
                    filterBy.map((filter) => {
                      const [field, value] = filter.split(':=');
                      return [field, [value]];
                    }),
                  )}
                  onFilterChange={(
                    field: string,
                    value: string | number | boolean,
                    checked: boolean,
                  ) => {
                    handleFilterChange(field, String(value), checked);
                  }}
                />
              </div>

              <div className="md:col-span-3 lg:col-span-4">
                <div className="flex justify-end items-center mb-4 gap-x-4">
                  <Select
                    value={perPage.toString()}
                    onValueChange={(value) =>
                      handlePerPageChange(parseInt(value))
                    }
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
                  <Select value={sortBy} onValueChange={handleSortByChange}>
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

                {searchResults.length === 0 && !loadingDocuments ? (
                  <div className="text-center text-gray-500">
                    No documents found.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {searchResults.map((result) => (
                      <DocumentCard
                        key={result.id}
                        result={result}
                        collectionName={collectionName}
                        onEdit={() => {}}
                        onDelete={() => {}}
                      />
                    ))}
                  </div>
                )}

                {!loadingDocuments && totalResults > 0 && (
                  <PaginationComponent
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
