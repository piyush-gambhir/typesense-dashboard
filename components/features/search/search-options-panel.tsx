'use client';

import React from 'react';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

interface SearchOptionsPanelProps {
    perPage: number;
    sortBy: string;
    showFacetDebugger: boolean;
    onPerPageChange: (value: number) => void;
    onSortByChange: (value: string) => void;
    onShowFacetDebuggerChange: (checked: boolean) => void;
    countDropdownOptions: { label: string; value: number }[];
    sortDropdownOptions: { label: string; value: string }[];
}

export default function SearchOptionsPanel({
    perPage,
    sortBy,
    showFacetDebugger,
    onPerPageChange,
    onSortByChange,
    onShowFacetDebuggerChange,
    countDropdownOptions,
    sortDropdownOptions,
}: Readonly<SearchOptionsPanelProps>) {
    return (
        <div className="flex flex-wrap items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
                <Select
                    value={String(perPage)}
                    onValueChange={(value) => onPerPageChange(parseInt(value))}
                >
                    <SelectTrigger className="w-20 h-8">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {countDropdownOptions.map((option) => (
                            <SelectItem key={option.value} value={String(option.value)}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            
            <div className="flex items-center gap-2">
                <Label className="text-sm whitespace-nowrap font-medium">Sort by:</Label>
                <Select value={sortBy} onValueChange={onSortByChange}>
                    <SelectTrigger className="w-40 h-8">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {sortDropdownOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            
            <div className="flex items-center gap-2">
                <Label className="text-sm whitespace-nowrap font-medium">Debug mode:</Label>
                <Switch
                    checked={showFacetDebugger}
                    onCheckedChange={onShowFacetDebuggerChange}
                />
            </div>
        </div>
    );
}