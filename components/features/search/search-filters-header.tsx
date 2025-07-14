'use client';

import React from 'react';

import { CollectionSchema } from '@/hooks/search/use-collection-schema';
import { FacetValue } from '@/hooks/search/use-facet-management';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { X } from 'lucide-react';

import Filter from './search-filters';

interface SearchFiltersHeaderProps {
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

export default function SearchFiltersHeader({
    collectionSchema,
    facetValues,
    filterBy,
    loadingFilters,
    onFilterChange,
    onClearFilters,
}: SearchFiltersHeaderProps) {
    // filterBy is already in the correct format
    const filterMap = filterBy;

    // Check if we have any facetable fields available
    const hasFacetableFields = Object.keys(facetValues).length > 0;

    if (!hasFacetableFields && !loadingFilters) {
        return (
            <div className="text-center py-4">
                <span className="text-sm text-muted-foreground">No filterable fields available</span>
            </div>
        );
    }

    if (loadingFilters) {
        return (
            <div className="space-y-4">
                <div className="h-5 w-20 bg-muted/50 rounded-lg animate-pulse" />
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="space-y-3 p-4 border rounded-xl bg-card/50">
                            <div className="h-4 w-16 bg-muted/50 rounded-lg animate-pulse" />
                            <div className="h-10 w-full bg-muted/50 rounded-lg animate-pulse" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-5">
            {/* Enhanced filters header */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-muted/20 to-muted/10 rounded-xl border border-border/50">
                <div className="flex items-center gap-2">
                    <h4 className="text-base font-semibold text-foreground">Filter Results</h4>
                    {Object.keys(filterMap).length > 0 && (
                        <span className="px-2 py-1 bg-primary/20 text-primary text-xs font-medium rounded-full">
                            {Object.keys(filterMap).length} active
                        </span>
                    )}
                </div>
                {Object.keys(filterMap).length > 0 && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onClearFilters}
                        className="text-sm h-9 px-4 border-2 hover:border-destructive/50 hover:text-destructive transition-colors"
                    >
                        Clear all filters
                    </Button>
                )}
            </div>

            {/* Enhanced filters layout */}
            <div className="w-full">
                <Filter
                    collectionSchema={collectionSchema}
                    facetValues={facetValues}
                    singleColumn={false}
                    filterBy={filterMap}
                    onFilterChange={onFilterChange}
                    onClearFilters={onClearFilters}
                />
            </div>
        </div>
    );
}