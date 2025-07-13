import { useState, useCallback, useRef } from 'react';
import { multiSearch, deleteDocument } from '@/lib/typesense/documents';

export interface SearchResult {
  id: string;
  [key: string]: unknown;
}

export function useSearchOperations(collectionName: string) {
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [totalResults, setTotalResults] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState<boolean>(true);

  const isSearching = useRef(false);

  const performSearch = useCallback(async (
    searchQuery: string,
    indexFields: string[],
    currentPage: number,
    perPage: number,
    sortBy: string,
    filterBy: string[]
  ) => {
    if (isSearching.current) return;

    isSearching.current = true;
    if (!isInitialLoad) {
      setLoading(true);
    }
    setError(null);

    // Validate required fields
    if (indexFields.length === 0) {
      console.warn('[performSearch] No string index fields available for search');
      setSearchResults([]);
      setTotalResults(0);
      setTotalPages(1);
      setLoading(false);
      setIsInitialLoad(false);
      isSearching.current = false;
      return;
    }

    // Build filter string properly - only include non-empty filters
    const validFilters = filterBy.filter((filter) => {
      if (!filter || filter.trim() === '') return false;

      // Validate filter format - should be field:=value
      if (!filter.includes(':=')) {
        console.warn('[performSearch] Invalid filter format:', filter);
        return false;
      }

      return true;
    });

    const filterString = validFilters.join(' && ');

    const queries = [
      {
        collection: collectionName,
        q: searchQuery || '*',
        queryBy: indexFields.length > 0 ? indexFields.join(',') : '*',
        highlightFullFields: indexFields.length > 0 ? indexFields.join(',') : '',
        page: currentPage,
        perPage,
        exhaustiveSearch: true,
        sortBy: sortBy === 'relevance' ? '' : sortBy,
        filterBy: filterString,
      },
    ];

    try {
      const response = await multiSearch({ searchQueries: queries });

      if (
        response &&
        response.results &&
        Array.isArray(response.results) &&
        response.results.length > 0
      ) {
        const documentsResponse = response.results[0];
        
        if (documentsResponse) {
          type SearchHit = {
            document: Record<string, unknown>;
          };
          type SearchResponse = {
            hits?: SearchHit[];
            found?: number;
          };
          
          const typedResponse = documentsResponse as SearchResponse;

          setSearchResults(
            typedResponse.hits?.map((hit) => hit.document as SearchResult) ?? []
          );
          setTotalResults(typedResponse.found ?? 0);
          const totalPages = Math.ceil((typedResponse.found ?? 0) / perPage);
          setTotalPages(totalPages);
        } else {
          setSearchResults([]);
          setTotalResults(0);
          setTotalPages(1);
        }
      } else {
        console.error('[performSearch] response.results is missing or empty:', response?.results);
        setSearchResults([]);
        setTotalResults(0);
        setTotalPages(1);
      }
    } catch (error) {
      console.error('Error performing search:', error);
      setError('Failed to perform search. Please try again.');
      setSearchResults([]);
      setTotalResults(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
      setIsInitialLoad(false);
      isSearching.current = false;
    }
  }, [collectionName, isInitialLoad]);

  const handleDeleteDocument = useCallback(async (documentId: string) => {
    try {
      await deleteDocument(collectionName, documentId);
      return true;
    } catch (error) {
      console.error('Error deleting document:', error);
      return false;
    }
  }, [collectionName]);

  return {
    searchResults,
    totalResults,
    totalPages,
    loading,
    error,
    isInitialLoad,
    performSearch,
    handleDeleteDocument,
    setError,
  };
}