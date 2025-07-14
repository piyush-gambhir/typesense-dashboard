'use client';

import { ChevronDown, X, Copy, Check } from 'lucide-react';
import React, { useState, useEffect } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import { Label } from '@/components/ui/label';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';

import { useCopyToClipboard } from '@/hooks/shared/use-copy-to-clipboard';

interface FacetValue {
    value: string | number | boolean;
    count: number;
}

interface FilterProps {
    collectionSchema: {
        fields: Array<{
            name: string;
            type: string;
            facet: boolean;
        }>;
    } | null;
    facetValues: Record<string, FacetValue[]>;
    filterBy: Record<string, (string | number | boolean)[]>;
    onFilterChange: (
        field: string,
        value: string | number | boolean,
        checked: boolean,
    ) => void;
    onClearFilters: () => void;
    singleColumn?: boolean;
}

const Filter = ({
    collectionSchema,
    facetValues,
    filterBy,
    onFilterChange,
    onClearFilters,
    singleColumn,
}: Readonly<FilterProps>) => {
    const [openPopovers, setOpenPopovers] = useState<Record<string, boolean>>(
        {},
    );
    const [searchQueries, setSearchQueries] = useState<Record<string, string>>(
        {},
    );
    const { copyToClipboard, isCopied, resetCopyState } = useCopyToClipboard();

    // Reset copy state after 2 seconds
    useEffect(() => {
        if (isCopied) {
            const timer = setTimeout(resetCopyState, 2000);
            return () => clearTimeout(timer);
        }
    }, [isCopied, resetCopyState]);


    const formatFieldLabel = (field: string): string => {
        return field
            .split('_')
            .map((word) => {
                if (word.toLowerCase() === 'id') {
                    return 'ID';
                }
                return word.charAt(0).toUpperCase() + word.slice(1);
            })
            .join(' ');
    };

    const getFieldType = (field: string): string => {
        if (!collectionSchema?.fields) return 'string';

        const schemaField = collectionSchema.fields.find(
            (f) => f.name === field && f.facet,
        );
        if (!schemaField) return 'string';

        return schemaField.type;
    };

    const getActiveFiltersCount = (): number => {
        return Object.values(filterBy).reduce(
            (total, values) => total + values.length,
            0,
        );
    };

    const clearFieldFilters = (field: string) => {
        const currentFilters = filterBy[field] || [];
        currentFilters.forEach((value) => {
            onFilterChange(field, value, false);
        });
    };

    const renderMultiSelectFilter = (field: string, values: FacetValue[]) => {
        const currentValues = filterBy[field] || [];
        const searchQuery = searchQueries[field] || '';

        // Filter values based on search query
        const filteredValues = values.filter((facet) =>
            String(facet.value)
                .toLowerCase()
                .includes(searchQuery.toLowerCase()),
        );

        const isOpen = openPopovers[field] || false;

        return (
            <div className="space-y-3 p-4 border-2 rounded-xl bg-card shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                    <Label className="text-sm font-semibold text-foreground truncate">
                        {formatFieldLabel(field)}
                    </Label>
                    {currentValues.length > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => clearFieldFilters(field)}
                            className="h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive rounded-md transition-colors"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    )}
                </div>

                <Popover
                    open={isOpen}
                    onOpenChange={(open) =>
                        setOpenPopovers((prev) => ({ ...prev, [field]: open }))
                    }
                >
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={isOpen}
                            className="w-full justify-between text-sm h-10 border-2 hover:border-primary/50 transition-colors"
                        >
                            {currentValues.length > 0
                                ? `${currentValues.length} selected`
                                : `All`}
                            <ChevronDown className="ml-1 h-3 w-3 shrink-0 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0" align="start">
                        <Command>
                            <div className="relative">
                                <CommandInput
                                    placeholder={`Search ${formatFieldLabel(field)}...`}
                                    value={searchQuery}
                                    onValueChange={(value) =>
                                        setSearchQueries((prev) => ({
                                            ...prev,
                                            [field]: value,
                                        }))
                                    }
                                    className="pr-8"
                                />
                                {searchQuery && (
                                    <div className="absolute inset-y-0 right-0 pr-2 flex items-center">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => copyToClipboard(searchQuery)}
                                            className="h-6 w-6 p-0 hover:bg-muted/50"
                                            title="Copy search text"
                                        >
                                            {isCopied ? (
                                                <Check className="h-3 w-3 text-green-600" />
                                            ) : (
                                                <Copy className="h-3 w-3 text-muted-foreground" />
                                            )}
                                        </Button>
                                    </div>
                                )}
                            </div>
                            <CommandList>
                                <CommandEmpty>
                                    No {formatFieldLabel(field)} found.
                                </CommandEmpty>
                                <CommandGroup>
                                    {filteredValues.map((facet) => {
                                        const isSelected =
                                            currentValues.includes(facet.value);
                                        return (
                                            <CommandItem
                                                key={`${field}-${facet.value}`}
                                                onSelect={() => {
                                                    onFilterChange(
                                                        field,
                                                        facet.value,
                                                        !isSelected,
                                                    );
                                                }}
                                                className="flex items-center justify-between"
                                            >
                                                <div className="flex items-center space-x-2">
                                                    <div
                                                        className={`w-4 h-4 rounded border ${
                                                            isSelected
                                                                ? 'bg-primary border-primary'
                                                                : 'border-gray-300'
                                                        } flex items-center justify-center`}
                                                    >
                                                        {isSelected && (
                                                            <div className="w-2 h-2 bg-white rounded-sm" />
                                                        )}
                                                    </div>
                                                    <span className="truncate">
                                                        {String(facet.value)}
                                                    </span>
                                                </div>
                                                <span className="text-xs text-muted-foreground">
                                                    ({facet.count})
                                                </span>
                                            </CommandItem>
                                        );
                                    })}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>

                {/* Show selected values as chips */}
                {currentValues.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                        {currentValues.map((value) => (
                            <Badge
                                key={`${field}-${value}`}
                                variant="secondary"
                                className="text-sm px-3 py-1 bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors"
                            >
                                {String(value)}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-5 w-5 p-0 ml-2 hover:bg-destructive/20 hover:text-destructive rounded-full transition-colors"
                                    onClick={() =>
                                        onFilterChange(field, value, false)
                                    }
                                >
                                    <X className="h-3 w-3" />
                                </Button>
                            </Badge>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    const renderBooleanFilter = (field: string) => {
        const currentValues = filterBy[field] || [];
        const isTrueSelected = currentValues.includes(true);
        const isFalseSelected = currentValues.includes(false);
        const hasAnySelection = currentValues.length > 0;

        return (
            <div className="space-y-3 p-4 border-2 rounded-xl bg-card shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                    <Label className="text-sm font-semibold text-foreground truncate">
                        {formatFieldLabel(field)}
                    </Label>
                    {hasAnySelection && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => clearFieldFilters(field)}
                            className="h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive rounded-md transition-colors"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    )}
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <Label className="text-sm font-medium">
                        {isTrueSelected ? 'True' : 'All values'}
                    </Label>
                    <Switch
                        checked={isTrueSelected}
                        onCheckedChange={(checked) => {
                            // Clear any existing filters for this field first
                            if (isTrueSelected) {
                                onFilterChange(field, true, false);
                            }
                            if (isFalseSelected) {
                                onFilterChange(field, false, false);
                            }
                            // Set the new value based on toggle state
                            if (checked) {
                                onFilterChange(field, true, true);
                            }
                            // If unchecked, we don't set any filter (shows "Any")
                        }}
                        className="data-[state=checked]:bg-primary"
                    />
                </div>
            </div>
        );
    };

    const renderNumberFilter = (field: string, values: FacetValue[]) => {
        // Don't filter out values - let all values through and let the UI handle them
        // This ensures we don't accidentally hide valid int field values
        if (values.length === 0) {
            return null;
        }

        // For number filters, show the values as multi-select like strings
        return renderMultiSelectFilter(field, values);
    };

    const activeFiltersCount = getActiveFiltersCount();

    return (
        <div className="w-full">
            {/* Filter sections */}
            <div
                className={`grid gap-4 ${singleColumn ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'}`}
            >
                {Object.entries(facetValues).map(([field, values]) => {
                    if (values.length === 0) return null; // Don't render if there are no options

                    const fieldType = getFieldType(field);


                    return (
                        <div key={field} className="w-full">
                            {(fieldType === 'string' ||
                                fieldType === 'string[]') &&
                                renderMultiSelectFilter(field, values)}
                            {fieldType === 'bool' && renderBooleanFilter(field)}
                            {['float', 'int32', 'int64', 'double'].includes(
                                fieldType,
                            ) && renderNumberFilter(field, values)}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Filter;
