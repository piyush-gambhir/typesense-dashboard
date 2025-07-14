'use client';

import React from 'react';

import { CollectionSchema } from '@/hooks/search/use-collection-schema';
import { FacetValue } from '@/hooks/search/use-facet-management';
import { SearchResult } from '@/hooks/search/use-search-operations';

import FacetDebugger from './facet-debugger';
import SearchResults from './search-results';

interface SearchMainContentProps {
    collectionSchema: CollectionSchema | null;
    facetValues: Record<string, FacetValue[]>;
    filterBy: Record<string, (string | number | boolean)[]>;
    searchResults: SearchResult[];
    totalResults: number;
    totalPages: number;
    currentPage: number;
    collectionName: string;
    loadingDocuments: boolean;
    loadingFilters: boolean;
    facetFields: string[];
    showFacetDebugger: boolean;
    onFilterChange: (
        field: string,
        value: string | boolean | number,
        checked: boolean,
    ) => void;
    onClearFilters: () => void;
    onPageChange: (page: number) => void;
    onDeleteDocument: (documentId: string) => Promise<void>;
}

export default function SearchMainContent({
    collectionSchema,
    facetValues,
    filterBy,
    searchResults,
    totalResults,
    totalPages,
    currentPage,
    collectionName,
    loadingDocuments,
    loadingFilters,
    facetFields,
    showFacetDebugger,
    onFilterChange,
    onClearFilters,
    onPageChange,
    onDeleteDocument,
}: Readonly<SearchMainContentProps>) {
    return (
        <div className="space-y-6">
            {/* Facet Debugger - only show when toggle is enabled */}
            {showFacetDebugger && (
                <FacetDebugger
                    collectionSchema={collectionSchema}
                    facetValues={facetValues}
                    facetFields={facetFields}
                />
            )}

            {/* Search Results */}
            <SearchResults
                searchResults={searchResults}
                totalResults={totalResults}
                totalPages={totalPages}
                currentPage={currentPage}
                collectionName={collectionName}
                loadingDocuments={loadingDocuments}
                onPageChange={onPageChange}
                onDeleteDocument={onDeleteDocument}
            />
        </div>
    );
}
