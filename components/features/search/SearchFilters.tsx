'use client';

import { ChevronDown, X } from 'lucide-react';
import React, { useState } from 'react';

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

    // Add debugging for component props
    console.log('[SearchFilters] Component props:', {
        facetValuesKeys: Object.keys(facetValues),
        facetValuesCount: Object.keys(facetValues).length,
        collectionSchemaFields: collectionSchema?.fields?.map((f) => ({
            name: f.name,
            type: f.type,
            facet: f.facet,
        })),
        filterByKeys: Object.keys(filterBy),
    });

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
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">
                        {formatFieldLabel(field)}
                    </Label>
                    {currentValues.length > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => clearFieldFilters(field)}
                            className="h-6 px-2 text-xs"
                        >
                            Clear
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
                            className="w-full justify-between text-sm"
                        >
                            {currentValues.length > 0
                                ? `${currentValues.length} selected`
                                : `Select ${formatFieldLabel(field)}`}
                            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0" align="start">
                        <Command>
                            <CommandInput
                                placeholder={`Search ${formatFieldLabel(field)}...`}
                                value={searchQuery}
                                onValueChange={(value) =>
                                    setSearchQueries((prev) => ({
                                        ...prev,
                                        [field]: value,
                                    }))
                                }
                            />
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
                    <div className="flex flex-wrap gap-1 mt-2">
                        {currentValues.map((value) => (
                            <Badge
                                key={`${field}-${value}`}
                                variant="secondary"
                                className="text-xs"
                            >
                                {String(value)}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
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
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">
                        {formatFieldLabel(field)}
                    </Label>
                    {hasAnySelection && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => clearFieldFilters(field)}
                            className="h-6 px-2 text-xs"
                        >
                            Clear
                        </Button>
                    )}
                </div>
                <div className="flex items-center justify-between">
                    <Label className="text-sm">
                        {isTrueSelected ? 'Enabled' : 'Any'}
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
                    />
                </div>
            </div>
        );
    };

    const renderNumberFilter = (field: string, values: FacetValue[]) => {
        console.log(
            `[renderNumberFilter] Starting to render number filter for field: ${field}`,
            {
                values,
                fieldType: getFieldType(field),
            },
        );

        // Don't filter out values - let all values through and let the UI handle them
        // This ensures we don't accidentally hide valid int field values
        if (values.length === 0) {
            console.log(
                `[renderNumberFilter] No values found for field: ${field}`,
            );
            return null;
        }

        console.log(
            `[renderNumberFilter] Rendering number filter for field: ${field}`,
            {
                values,
                fieldType: getFieldType(field),
            },
        );

        // For number filters, show the values as multi-select like strings
        return renderMultiSelectFilter(field, values);
    };

    const activeFiltersCount = getActiveFiltersCount();

    return (
        <div className="space-y-6">
            {/* Filter chips header */}
            {activeFiltersCount > 0 && (
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium">Active Filters</h3>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onClearFilters}
                            className="h-6 px-2 text-xs"
                        >
                            Clear All
                        </Button>
                    </div>
                    <div className="flex flex-wrap gap-1">
                        {Object.entries(filterBy).map(([field, values]) =>
                            values.map((value) => (
                                <Badge
                                    key={`${field}-${value}`}
                                    variant="secondary"
                                    className="text-xs"
                                >
                                    {formatFieldLabel(field)}: {String(value)}
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
                                        onClick={() =>
                                            onFilterChange(field, value, false)
                                        }
                                    >
                                        <X className="h-3 w-3" />
                                    </Button>
                                </Badge>
                            )),
                        )}
                    </div>
                </div>
            )}

            {/* Filter sections */}
            <div
                className={`grid gap-4 ${singleColumn ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}
            >
                {Object.entries(facetValues).map(([field, values]) => {
                    if (values.length === 0) return null; // Don't render if there are no options

                    const fieldType = getFieldType(field);

                    // Add debugging for field rendering
                    console.log(`[SearchFilters] Rendering field: ${field}`, {
                        fieldType,
                        valuesCount: values.length,
                        values: values.slice(0, 3), // Show first 3 values for debugging
                        isIntField: [
                            'float',
                            'int32',
                            'int64',
                            'double',
                        ].includes(fieldType),
                    });

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
