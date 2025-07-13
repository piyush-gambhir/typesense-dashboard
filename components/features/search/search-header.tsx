'use client';

import React, { useState } from 'react';

import { Card, CardContent } from '@/components/ui/card';

import SearchBar from './search-bar';
import SearchErrorAlert from './search-error-alert';
import SearchOptionsPanel from './search-options-panel';

interface SearchHeaderProps {
    collectionName: string;
    searchQuery: string;
    totalResults: number;
    error: string | null;
    onSearchQueryChange: (query: string) => void;
    onRetry: () => void;
    onDismissError: () => void;
    perPage: number;
    sortBy: string;
    onPerPageChange: (value: number) => void;
    onSortByChange: (value: string) => void;
    countDropdownOptions: { label: string; value: number }[];
    sortDropdownOptions: { label: string; value: string }[];
}

export default function SearchHeader({
    collectionName,
    searchQuery,
    totalResults,
    error,
    onSearchQueryChange,
    onRetry,
    onDismissError,
    perPage,
    sortBy,
    onPerPageChange,
    onSortByChange,
    countDropdownOptions,
    sortDropdownOptions,
}: SearchHeaderProps) {
    const [showFacetDebugger, setShowFacetDebugger] = useState<boolean>(false);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight">
                        Search Documents
                    </h1>
                    <p className="text-muted-foreground">
                        Search and filter documents in the {collectionName}{' '}
                        collection
                    </p>
                </div>
                {totalResults > 0 && (
                    <div className="text-right">
                        <div className="text-2xl font-bold">
                            {totalResults.toLocaleString()}
                        </div>
                        <div className="text-sm text-muted-foreground">
                            documents found
                        </div>
                    </div>
                )}
            </div>

            <SearchErrorAlert
                error={error}
                onRetry={onRetry}
                onDismiss={onDismissError}
            />

            <SearchBar
                searchQuery={searchQuery}
                onSearchQueryChange={onSearchQueryChange}
                placeholder="Search documents across all fields..."
            />

            <Card className="border border-border/50">
                <CardContent className="p-6">
                    <SearchOptionsPanel
                        perPage={perPage}
                        sortBy={sortBy}
                        showFacetDebugger={showFacetDebugger}
                        onPerPageChange={onPerPageChange}
                        onSortByChange={onSortByChange}
                        onShowFacetDebuggerChange={setShowFacetDebugger}
                        countDropdownOptions={countDropdownOptions}
                        sortDropdownOptions={sortDropdownOptions}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
