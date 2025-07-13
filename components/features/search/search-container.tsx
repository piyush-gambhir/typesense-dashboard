'use client';

import React, { useEffect } from 'react';

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
}: SearchContainerProps) {
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
        getFilterByFromParams,
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

    // Debounced values for search
    const debouncedSearchQuery = useDebounce<string>(searchQuery, 300);
    const debouncedFilterBy = useDebounce<string[]>(filterBy, 500);

    const { facetValues, loading: facetsLoading } = useFacetManagement(
        collectionName,
        collectionSchema,
        facetFields,
        indexFields,
        debouncedSearchQuery,
        debouncedFilterBy,
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
                debouncedFilterBy,
            );
        }
    }, [
        debouncedSearchQuery,
        currentPage,
        perPage,
        sortBy,
        debouncedFilterBy,
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
                debouncedFilterBy,
            );
        }
    }, [indexFields, isInitialLoad, performSearch]);

    // Filter management
    const handleFilterChange = (
        field: string,
        value: string | boolean | number,
        checked: boolean,
    ) => {
        let stringValue: string;
        if (typeof value === 'boolean') {
            stringValue = value ? 'true' : 'false';
        } else if (typeof value === 'number') {
            stringValue = String(value);
        } else {
            stringValue = String(value);
        }

        const filterString = `${field}:=${stringValue}`;

        const newFilters = checked
            ? filterBy.includes(filterString)
                ? filterBy
                : [...filterBy, filterString]
            : filterBy.filter((item) => item !== filterString);

        if (
            JSON.stringify(newFilters.sort()) !==
            JSON.stringify(filterBy.sort())
        ) {
            updateFilterBy(newFilters);
        }
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
                debouncedFilterBy,
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
                        debouncedFilterBy,
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
                onFilterChange={handleFilterChange}
                onClearFilters={clearFilters}
                onPageChange={updatePage}
                onDeleteDocument={handleDeleteDocumentWithRefresh}
            />
        </div>
    );
}
