'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface SearchBarProps {
    searchQuery: string;
    onSearchQueryChange: (query: string) => void;
    placeholder?: string;
}

export default function SearchBar({
    searchQuery,
    onSearchQueryChange,
    placeholder = "Search documents across all fields..."
}: Readonly<SearchBarProps>) {
    return (
        <Card className="border border-border/50">
            <CardContent className="p-6">
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <Input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => onSearchQueryChange(e.target.value)}
                        placeholder={placeholder}
                        className="pl-10 h-12 text-base"
                    />
                </div>
            </CardContent>
        </Card>
    );
}