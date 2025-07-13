'use client';

import React from 'react';

import { CollectionSchema } from '@/hooks/search/use-collection-schema';
import { FacetValue } from '@/hooks/search/use-facet-management';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

import Filter from './search-filters';

interface SearchFiltersSidebarProps {
    collectionSchema: CollectionSchema | null;
    facetValues: Record<string, FacetValue[]>;
    filterBy: string[];
    loadingFilters: boolean;
    onFilterChange: (
        field: string,
        value: string | boolean | number,
        checked: boolean,
    ) => void;
    onClearFilters: () => void;
}

export default function SearchFiltersSidebar({
    collectionSchema,
    facetValues,
    filterBy,
    loadingFilters,
    onFilterChange,
    onClearFilters,
}: SearchFiltersSidebarProps) {
    // Convert filterBy array to the format expected by Filter component
    const filterMap: Record<string, (string | number | boolean)[]> = {};

    filterBy.forEach((filter) => {
        if (filter) {
            let field: string, value: string;

            if (filter.includes(':=')) {
                const separatorIndex = filter.indexOf(':=');
                field = filter.substring(0, separatorIndex);
                value = filter.substring(separatorIndex + 2);
            } else {
                return; // Skip invalid filters
            }

            if (field && value !== undefined) {
                // Convert string values back to their original types
                let parsedValue: string | number | boolean;
                if (value === 'true') {
                    parsedValue = true;
                } else if (value === 'false') {
                    parsedValue = false;
                } else if (
                    !isNaN(Number(value)) &&
                    value !== '' &&
                    value !== 'null'
                ) {
                    parsedValue = Number(value);
                } else {
                    parsedValue = value;
                }

                if (!filterMap[field]) {
                    filterMap[field] = [];
                }
                filterMap[field].push(parsedValue);
            }
        }
    });

    return (
        <div className="lg:col-span-1">
            <Card className="border border-border/50 sticky top-8">
                <CardContent className="p-6">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold">Filters</h3>
                            {filterBy.length > 0 && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={onClearFilters}
                                    className="text-xs"
                                >
                                    Clear all
                                </Button>
                            )}
                        </div>

                        {loadingFilters ? (
                            <div className="space-y-6">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="space-y-3">
                                        <div className="h-4 w-24 bg-muted/50 rounded animate-pulse" />
                                        <div className="space-y-2">
                                            {[1, 2, 3].map((j) => (
                                                <div
                                                    key={j}
                                                    className="flex items-center space-x-2"
                                                >
                                                    <div className="h-4 w-4 bg-muted/50 rounded animate-pulse" />
                                                    <div className="h-4 w-20 bg-muted/50 rounded animate-pulse" />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <Filter
                                collectionSchema={collectionSchema}
                                facetValues={facetValues}
                                singleColumn={true}
                                filterBy={filterMap}
                                onFilterChange={(field, value, checked) => {
                                    onFilterChange(
                                        field,
                                        typeof value === 'boolean'
                                            ? value
                                            : String(value),
                                        checked,
                                    );
                                }}
                                onClearFilters={onClearFilters}
                            />
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
