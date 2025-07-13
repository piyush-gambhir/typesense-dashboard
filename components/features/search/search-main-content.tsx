'use client';

import React, { useState } from 'react';

import { CollectionSchema } from '@/hooks/search/use-collection-schema';
import { FacetValue } from '@/hooks/search/use-facet-management';
import { SearchResult } from '@/hooks/search/use-search-operations';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

import FacetDebugger from './facet-debugger';
import SearchFiltersSidebar from './search-filters-sidebar';
import SearchResults from './search-results';

interface SearchMainContentProps {
    collectionSchema: CollectionSchema | null;
    facetValues: Record<string, FacetValue[]>;
    filterBy: string[];
    searchResults: SearchResult[];
    totalResults: number;
    totalPages: number;
    currentPage: number;
    collectionName: string;
    loadingDocuments: boolean;
    loadingFilters: boolean;
    facetFields: string[];
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
    onFilterChange,
    onClearFilters,
    onPageChange,
    onDeleteDocument,
}: SearchMainContentProps) {
    const [showFacetDebugger, setShowFacetDebugger] = useState<boolean>(false);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Filters Sidebar */}
            <SearchFiltersSidebar
                collectionSchema={collectionSchema}
                facetValues={facetValues}
                filterBy={filterBy}
                loadingFilters={loadingFilters}
                onFilterChange={onFilterChange}
                onClearFilters={onClearFilters}
            />

            {/* Results Area */}
            <div className="lg:col-span-3">
                <div className="space-y-6">
                    {/* Debug Controls */}
                    <div className="flex items-center justify-between">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                                setShowFacetDebugger(!showFacetDebugger)
                            }
                        >
                            {showFacetDebugger ? 'Hide' : 'Show'} Facet Debugger
                        </Button>
                    </div>

                    {/* Facet Debugger - only show when toggle is enabled */}
                    {showFacetDebugger && (
                        <Card className="border border-border/50">
                            <CardContent className="p-6">
                                <FacetDebugger
                                    collectionSchema={collectionSchema}
                                    facetValues={facetValues}
                                    facetFields={facetFields}
                                />
                            </CardContent>
                        </Card>
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
            </div>
        </div>
    );
}
