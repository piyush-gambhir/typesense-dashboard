'use client';

import React, { useEffect } from 'react';
import { Copy, Check } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useCopyToClipboard } from '@/hooks/shared/use-copy-to-clipboard';

interface SearchBarProps {
    searchQuery: string;
    onSearchQueryChange: (query: string) => void;
    placeholder?: string;
}

export default function SearchBar({
    searchQuery,
    onSearchQueryChange,
    placeholder = 'Search documents across all fields...',
}: Readonly<SearchBarProps>) {
    const { copyToClipboard, isCopied, resetCopyState } = useCopyToClipboard();

    // Reset copy state after 2 seconds
    useEffect(() => {
        if (isCopied) {
            const timer = setTimeout(resetCopyState, 2000);
            return () => clearTimeout(timer);
        }
    }, [isCopied, resetCopyState]);

    const handleCopy = async () => {
        if (searchQuery.trim()) {
            await copyToClipboard(searchQuery);
        }
    };

    return (
        <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg
                    className="h-5 w-5 text-muted-foreground"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                </svg>
            </div>
            <Input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchQueryChange(e.target.value)}
                placeholder={placeholder}
                className="pl-12 pr-14 h-14 text-base border-2 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 bg-background/80"
            />
            {searchQuery.trim() && (
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCopy}
                        className="h-10 w-10 p-0 hover:bg-muted/80 rounded-lg transition-colors"
                        title="Copy search query"
                    >
                        {isCopied ? (
                            <Check className="h-5 w-5 text-green-600" />
                        ) : (
                            <Copy className="h-5 w-5 text-muted-foreground hover:text-foreground" />
                        )}
                    </Button>
                </div>
            )}
        </div>
    );
}
