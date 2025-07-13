import { useState, useCallback } from 'react';
import useQueryParams from '@/hooks/use-query-params';

export interface SearchState {
  searchQuery: string;
  perPage: number;
  currentPage: number;
  sortBy: string;
  filterBy: string[];
}

export function useSearchState() {
  const { queryParams, setQueryParams } = useQueryParams();

  // Initialize state from URL params
  const [searchQuery, setSearchQuery] = useState<string>(
    Array.isArray(queryParams.q) ? queryParams.q[0] || '' : queryParams.q || ''
  );
  const [perPage, setPerPage] = useState<number>(
    parseInt(
      Array.isArray(queryParams.perPage) 
        ? queryParams.perPage[0] || '12' 
        : queryParams.perPage || '12'
    )
  );
  const [currentPage, setCurrentPage] = useState<number>(
    parseInt(
      Array.isArray(queryParams.page) 
        ? queryParams.page[0] || '1' 
        : queryParams.page || '1'
    )
  );
  const [sortBy, setSortBy] = useState<string>(
    Array.isArray(queryParams.sortBy) 
      ? queryParams.sortBy[0] || 'relevance' 
      : queryParams.sortBy || 'relevance'
  );

  // Handle filter_by parameter properly
  const getFilterByFromParams = useCallback((): string[] => {
    const filterByParam = queryParams.filter_by;
    let filters: string[] = [];

    if (Array.isArray(filterByParam)) {
      filters = filterByParam;
    } else if (typeof filterByParam === 'string' && filterByParam.trim() !== '') {
      filters = filterByParam
        .split(',')
        .filter(Boolean)
        .map((f) => f.trim());
    }

    // Convert any old format boolean filters to new format and validate
    const convertedFilters = filters
      .map((filter) => {
        if (!filter || filter.trim() === '') return null;

        if (filter.includes(':') && !filter.includes(':=')) {
          const colonIndex = filter.indexOf(':');
          const field = filter.substring(0, colonIndex);
          const value = filter.substring(colonIndex + 1);
          return `${field}:=${value}`;
        }
        return filter;
      })
      .filter((filter): filter is string => filter !== null);

    return convertedFilters;
  }, [queryParams.filter_by]);

  const [filterBy, setFilterBy] = useState<string[]>(getFilterByFromParams());

  const updateSearchQuery = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const updatePerPage = useCallback((value: number) => {
    setQueryParams({
      ...queryParams,
      perPage: String(value),
      page: '1',
    });
    setPerPage(value);
    setCurrentPage(1);
  }, [queryParams, setQueryParams]);

  const updateSortBy = useCallback((value: string, sortOptions: { label: string; value: string }[]) => {
    const isValidSort = value === 'relevance' || sortOptions.some((option) => option.value === value);

    if (isValidSort) {
      setQueryParams({ ...queryParams, sortBy: value, page: '1' });
      setSortBy(value);
      setCurrentPage(1);
    } else {
      console.warn('[updateSortBy] Invalid sort value:', value);
      setQueryParams({ ...queryParams, sortBy: 'relevance', page: '1' });
      setSortBy('relevance');
      setCurrentPage(1);
    }
  }, [queryParams, setQueryParams]);

  const updatePage = useCallback((page: number) => {
    setQueryParams({ ...queryParams, page: String(page) });
    setCurrentPage(page);
  }, [queryParams, setQueryParams]);

  const updateFilterBy = useCallback((newFilters: string[]) => {
    setFilterBy(newFilters);
    
    if (newFilters.length > 0) {
      const newParams = {
        ...queryParams,
        filter_by: newFilters.join(','),
        page: '1',
      };
      setQueryParams(newParams);
    } else {
      const newParams: Record<string, string> = {
        ...queryParams,
        page: '1',
      };
      delete (newParams as any).filter_by;
      setQueryParams(newParams);
    }
    setCurrentPage(1);
  }, [queryParams, setQueryParams]);

  const clearFilters = useCallback(() => {
    setFilterBy([]);
    const newParams: Record<string, string> = { ...queryParams, page: '1' };
    delete (newParams as any).filter_by;
    setQueryParams(newParams);
    setCurrentPage(1);
  }, [queryParams, setQueryParams]);

  return {
    // State
    searchQuery,
    perPage,
    currentPage,
    sortBy,
    filterBy,
    
    // Setters
    setSearchQuery,
    setPerPage,
    setCurrentPage,
    setSortBy,
    setFilterBy,
    
    // Actions
    updateSearchQuery,
    updatePerPage,
    updateSortBy,
    updatePage,
    updateFilterBy,
    clearFilters,
    
    // Utils
    getFilterByFromParams,
  };
}