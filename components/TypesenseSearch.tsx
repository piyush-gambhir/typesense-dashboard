'use client';

import { Loader2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';

import { getCollection } from '@/lib/typesense/actions/collections';
import { multiSearch } from '@/lib/typesense/actions/documents';

import { useDebounce } from '@/hooks/useDebounce';
import { useQueryParams } from '@/hooks/useQueryParams';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
}

export default function TypesenseSearch({
  collectionName,
}: TypesenseSearchProps) {
  const [queryParams, setQueryParams] = useQueryParams();

  const [indexFields, setIndexFields] = useState<string[]>([]);
  const [facetFields, setFacetFields] = useState<string[]>([]);
  const [sortFields, setSortFields] = useState<string[]>([]);

  const [searchQuery, setSearchQuery] = useState<string>(queryParams.q ?? '');
  const [perPage, setPerPage] = useState<number>(
    parseInt(queryParams.perPage ?? '10'),
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

  const debouncedSearchQuery = useDebounce<string>(searchQuery, 300);

  const [sortDropdownOptions, setSortDropdownOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const [countDropdownOptions, setCountDropdownOptions] = useState<
    { label: string; value: number }[]
  >([]);

  // Perform search for documents (without refreshing facets)
  const performMultiSearch = async () => {
    setLoadingDocuments(true);
    const queries = [
      {
        collection: collectionName,
        q: queryParams.q ?? '*',
        queryBy: indexFields.join(','), // dynamic index fields
        highlightFullFields: indexFields.join(','),
        page: currentPage,
        perPage,
        exhaustiveSearch: true,
        sortBy: queryParams?.sort_by ?? '',
        filterBy: filterBy.join(','), // dynamic filters
      },
    ];

    try {
      const response = await multiSearch({
        searchQueries: queries,
      });

      if (response && response.results && response.results.length > 0) {
        const [documentsResponse] = response.results;
        setSearchResults(
          documentsResponse.hits?.map((hit) => hit.document) ?? [],
        );
        setTotalResults(documentsResponse?.found ?? 0);
        const totalPages = Math.ceil((documentsResponse?.found ?? 0) / perPage);
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

  // Fetch the facets (only once)
  useEffect(() => {
    const fetchFacets = async () => {
      setLoadingFilters(true);
      try {
        const queries = [
          {
            collection: collectionName,
            q: '*', // Fetch all documents to get facet counts
            facetBy: facetFields.join(','), // Fetch facets only
            maxFacetValues: 10,
            perPage: 0, // Don't fetch any documents, just facet counts
          },
        ];

        const response = await multiSearch({
          searchQueries: queries,
        });

        if (response && response.results && response.results.length > 0) {
          const [documentsResponse] = response.results;
          setFacetValues(
            documentsResponse.facet_counts?.reduce(
              (acc, facet) => {
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

  // Fetch Schema for Collection
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

  // Handle search whenever query parameters change (excluding facets)
  useEffect(() => {
    const params: Record<string, string> = {};
    if (debouncedSearchQuery) params.q = debouncedSearchQuery;
    if (currentPage > 1) params.page = currentPage.toString();
    if (sortBy !== 'relevance') params.sort_by = sortBy;
    if (filterBy.length > 0) params.filter_by = filterBy.join(',');

    setQueryParams(params);
    performMultiSearch(); // Only fetch search results
  }, [
    debouncedSearchQuery,
    currentPage,
    sortBy,
    filterBy,
    indexFields,
    sortFields,
  ]);

  // Handle filter changes
  const handleFilterChange = (value: string, checked: boolean) => {
    setFilterBy((prev) =>
      checked ? [...prev, value] : prev.filter((item) => item !== value),
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
    <div className="container mx-auto py-12 px-6 flex flex-col gap-y-4">
      <h1 className="text-3xl font-bold mb-6">Search Documents</h1>

      {/* Loading state when both filters and documents are loading */}
      {loadingDocuments || loadingFilters ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
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
                onValueChange={(value) => handlePerPageChange(parseInt(value))}
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {searchResults.map((result) => (
                  <DocumentCard key={result.id} result={result} />
                ))}
              </div>
            )}

            {/* Only show pagination if there are documents and loading is complete */}
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
    </div>
  );
}
