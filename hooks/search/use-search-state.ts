import { useState, useCallback } from 'react';

export interface SearchState {
  searchQuery: string;
  perPage: number;
  currentPage: number;
  sortBy: string;
  filterBy: Record<string, (string | number | boolean)[]>;
}

export function useSearchState() {
  // Initialize state with local state only (no URL params)
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [perPage, setPerPage] = useState<number>(12);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [sortBy, setSortBy] = useState<string>('relevance');
  const [filterBy, setFilterBy] = useState<Record<string, (string | number | boolean)[]>>({});

  const updateSearchQuery = useCallback((query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  }, []);

  const updatePerPage = useCallback((value: number) => {
    setPerPage(value);
    setCurrentPage(1);
  }, []);

  const updateSortBy = useCallback((value: string, sortOptions: { label: string; value: string }[]) => {
    const isValidSort = value === 'relevance' || sortOptions.some((option) => option.value === value);

    if (isValidSort) {
      setSortBy(value);
      setCurrentPage(1);
    } else {
      console.warn('[updateSortBy] Invalid sort value:', value);
      setSortBy('relevance');
      setCurrentPage(1);
    }
  }, []);

  const updatePage = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const updateFilterBy = useCallback((newFilters: Record<string, (string | number | boolean)[]>) => {
    setFilterBy(newFilters);
    setCurrentPage(1);
  }, []);

  const clearFilters = useCallback(() => {
    setFilterBy({});
    setCurrentPage(1);
  }, []);

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
  };
}