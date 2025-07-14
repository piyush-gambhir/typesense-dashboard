'use client';

import React from 'react';

import { CollectionSchema } from '@/hooks/search/use-collection-schema';
import { FacetValue } from '@/hooks/search/use-facet-management';

import { Switch } from '@/components/ui/switch';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

import SearchBar from './search-bar';
import SearchErrorAlert from './search-error-alert';
import SearchFiltersHeader from './search-filters-header';

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
    showFacetDebugger: boolean;
    onShowFacetDebuggerChange: (checked: boolean) => void;
    // Filter props
    collectionSchema: CollectionSchema | null;
    facetValues: Record<string, FacetValue[]>;
    filterBy: Record<string, (string | number | boolean)[]>;
    loadingFilters: boolean;
    onFilterChange: (
        field: string,
        value: string | boolean | number,
        checked: boolean,
    ) => void;
    onClearFilters: () => void;
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
    showFacetDebugger,
    onShowFacetDebuggerChange,
    // Filter props
    collectionSchema,
    facetValues,
    filterBy,
    loadingFilters,
    onFilterChange,
    onClearFilters,
}: Readonly<SearchHeaderProps>) {
    return (
        <div className="space-y-4">
            <div className="space-y-1">
                <h1 className="text-3xl font-bold tracking-tight">
                    Search Documents
                </h1>
                <p className="text-muted-foreground">
                    Search and filter documents in the {collectionName} collection
                </p>
            </div>

            <SearchErrorAlert
                error={error}
                onRetry={onRetry}
                onDismiss={onDismissError}
            />

            {/* Unified Search Interface */}
            <div className="space-y-8">
                {/* Search Bar */}
                <SearchBar
                    searchQuery={searchQuery}
                    onSearchQueryChange={onSearchQueryChange}
                    placeholder="Search documents across all fields..."
                />
                
                {/* Enhanced Search Controls */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-gradient-to-r from-muted/30 to-muted/10 rounded-xl border border-border/60 shadow-sm">
                    <div className="flex flex-wrap items-center gap-6">
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-muted-foreground min-w-fit">Results per page:</span>
                            <Select
                                value={String(perPage)}
                                onValueChange={(value) => onPerPageChange(parseInt(value))}
                            >
                                <SelectTrigger className="w-20 h-10 text-sm font-medium border-2 hover:border-primary/50 transition-colors">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {countDropdownOptions.map((option) => (
                                        <SelectItem key={option.value} value={String(option.value)} className="text-sm">
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-muted-foreground min-w-fit">Sort by:</span>
                            <Select value={sortBy} onValueChange={onSortByChange}>
                                <SelectTrigger className="w-40 h-10 text-sm font-medium border-2 hover:border-primary/50 transition-colors">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {sortDropdownOptions.map((option) => (
                                        <SelectItem key={option.value} value={option.value} className="text-sm">
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-muted-foreground min-w-fit">Debug mode:</span>
                            <Switch
                                checked={showFacetDebugger}
                                onCheckedChange={onShowFacetDebuggerChange}
                                className="data-[state=checked]:bg-primary"
                            />
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        {totalResults > 0 && (
                            <div className="px-3 py-1.5 bg-primary/10 rounded-lg border border-primary/20">
                                <span className="text-sm font-semibold text-primary">{totalResults.toLocaleString()}</span>
                                <span className="text-sm text-muted-foreground ml-1">results found</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Inline Filters */}
                <SearchFiltersHeader
                    collectionSchema={collectionSchema}
                    facetValues={facetValues}
                    filterBy={filterBy}
                    loadingFilters={loadingFilters}
                    onFilterChange={onFilterChange}
                    onClearFilters={onClearFilters}
                />
            </div>
        </div>
    );
}
