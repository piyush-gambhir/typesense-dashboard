'use client';

import React, { useEffect, useState, useMemo } from 'react';

import { useCollectionSchema } from '@/hooks/search/use-collection-schema';
import { useFacetManagement } from '@/hooks/search/use-facet-management';
import { useSearchOperations } from '@/hooks/search/use-search-operations';
import { useSearchState } from '@/hooks/search/use-search-state';
import { useDebounce } from '@/hooks/use-debounce';

import { Alert, AlertDescription } from '@/components/ui/alert';

import SearchHeader from './search-header';
import SearchMainContent from './search-main-content';
import SearchSkeleton from './search-skeleton';

interface SearchContainerProps {
    collectionName: string;
}

export default function SearchContainer({
    collectionName,
}: Readonly<SearchContainerProps>) {
    // Facet debugger state
    const [showFacetDebugger, setShowFacetDebugger] = useState<boolean>(false);

    // Initialize all hooks first (before any early returns)
    const {
        searchQuery,
        perPage,
        currentPage,
        sortBy,
        filterBy,
        updateSearchQuery,
        updatePerPage,
        updateSortBy,
        updatePage,
        updateFilterBy,
        clearFilters,
    } = useSearchState();

    const {
        collectionSchema,
        indexFields,
        facetFields,
        sortDropdownOptions,
        countDropdownOptions,
        loading: schemaLoading,
        error: schemaError,
        setError: setSchemaError,
    } = useCollectionSchema(collectionName);

    // Convert filterBy object to Typesense filter string
    const convertFilterByToString = (filterObj: Record<string, (string | number | boolean)[]>): string => {
        const filterParts: string[] = [];

        Object.entries(filterObj).forEach(([field, values]) => {
            if (values.length > 0) {
                const fieldFilters = values.map((value) => {
                    if (typeof value === 'boolean') {
                        return `${field}:=${value}`;
                    } else if (typeof value === 'number') {
                        return `${field}:=${value}`;
                    } else {
                        return `${field}:="${value}"`;
                    }
                });
                filterParts.push(`(${fieldFilters.join(' || ')})`);
            }
        });

        return filterParts.join(' && ');
    };

    // Debounced values for search
    const debouncedSearchQuery = useDebounce<string>(searchQuery, 300);
    const debouncedFilterBy = useDebounce<Record<string, (string | number | boolean)[]>>(filterBy, 500);
    
    // Convert filter object to string array for hooks
    const debouncedFilterByArray = useMemo(() => {
        const filterString = convertFilterByToString(debouncedFilterBy);
        return filterString ? [filterString] : [];
    }, [debouncedFilterBy]);

    const { facetValues, loading: facetsLoading } = useFacetManagement(
        collectionName,
        collectionSchema,
        facetFields,
        indexFields,
        debouncedSearchQuery,
        debouncedFilterByArray,
    );

    const {
        searchResults,
        totalResults,
        totalPages,
        loading: searchLoading,
        error: searchError,
        isInitialLoad,
        performSearch,
        handleDeleteDocument,
        setError: setSearchError,
    } = useSearchOperations(collectionName);

    // Perform search when dependencies change
    useEffect(() => {
        if (indexFields.length > 0 && !isInitialLoad) {
            performSearch(
                debouncedSearchQuery,
                indexFields,
                currentPage,
                perPage,
                sortBy,
                debouncedFilterByArray,
            );
        }
    }, [
        debouncedSearchQuery,
        currentPage,
        perPage,
        sortBy,
        debouncedFilterByArray,
        indexFields,
        isInitialLoad,
        performSearch,
    ]);

    // Trigger initial search when schema is loaded
    useEffect(() => {
        if (indexFields.length > 0 && isInitialLoad) {
            performSearch(
                debouncedSearchQuery,
                indexFields,
                currentPage,
                perPage,
                sortBy,
                debouncedFilterByArray,
            );
        }
    }, [indexFields, isInitialLoad, performSearch, debouncedSearchQuery, currentPage, perPage, sortBy, debouncedFilterByArray]);

    // Filter management
    const handleFilterChange = (
        field: string,
        value: string | boolean | number,
        checked: boolean,
    ) => {
        const newFilters = { ...filterBy };
        const currentValues = newFilters[field] || [];

        if (checked) {
            if (!currentValues.includes(value)) {
                newFilters[field] = [...currentValues, value];
            }
        } else {
            newFilters[field] = currentValues.filter((v) => v !== value);
            if (newFilters[field].length === 0) {
                delete newFilters[field];
            }
        }

        updateFilterBy(newFilters);
    };

    const handleSortChange = (value: string) => {
        updateSortBy(value, sortDropdownOptions);
    };

    const handleDeleteDocumentWithRefresh = async (documentId: string) => {
        const success = await handleDeleteDocument(documentId);
        if (success) {
            // Refresh search results after deletion
            performSearch(
                debouncedSearchQuery,
                indexFields,
                currentPage,
                perPage,
                sortBy,
                debouncedFilterByArray,
            );
        }
    };

    // Validate collection name
    if (!collectionName || typeof collectionName !== 'string') {
        return (
            <div className="p-8">
                <Alert>
                    <AlertDescription>
                        Invalid collection name provided.
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    // Show skeleton on initial load
    if (isInitialLoad && (searchLoading || facetsLoading || schemaLoading)) {
        return <SearchSkeleton />;
    }

    const error = schemaError || searchError;

    return (
        <div className="container mx-auto px-4 py-8 space-y-8">
            <SearchHeader
                collectionName={collectionName}
                searchQuery={searchQuery}
                totalResults={totalResults}
                error={error}
                onSearchQueryChange={updateSearchQuery}
                onRetry={() => {
                    setSchemaError(null);
                    setSearchError(null);
                    performSearch(
                        debouncedSearchQuery,
                        indexFields,
                        currentPage,
                        perPage,
                        sortBy,
                        debouncedFilterByArray,
                    );
                }}
                onDismissError={() => {
                    setSchemaError(null);
                    setSearchError(null);
                }}
                perPage={perPage}
                sortBy={sortBy}
                onPerPageChange={updatePerPage}
                onSortByChange={handleSortChange}
                countDropdownOptions={countDropdownOptions}
                sortDropdownOptions={sortDropdownOptions}
                showFacetDebugger={showFacetDebugger}
                onShowFacetDebuggerChange={setShowFacetDebugger}
                // Filter props
                collectionSchema={collectionSchema}
                facetValues={facetValues}
                filterBy={filterBy}
                loadingFilters={facetsLoading}
                onFilterChange={handleFilterChange}
                onClearFilters={clearFilters}
            />

            <SearchMainContent
                collectionSchema={collectionSchema}
                facetValues={facetValues}
                filterBy={filterBy}
                searchResults={searchResults}
                totalResults={totalResults}
                totalPages={totalPages}
                currentPage={currentPage}
                collectionName={collectionName}
                loadingDocuments={searchLoading}
                loadingFilters={facetsLoading}
                facetFields={facetFields}
                showFacetDebugger={showFacetDebugger}
                onFilterChange={handleFilterChange}
                onClearFilters={clearFilters}
                onPageChange={updatePage}
                onDeleteDocument={handleDeleteDocumentWithRefresh}
            />
        </div>
    );
}
