'use client';

import React from 'react';

import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

import PaginationComponent from '@/components/common/pagination';
import DocumentCard from '@/components/features/documents/document-card';

interface SearchResult {
    id: string;
    [key: string]: unknown;
}

interface SearchResultsProps {
    searchResults: SearchResult[];
    totalResults: number;
    totalPages: number;
    currentPage: number;
    collectionName: string;
    loadingDocuments: boolean;
    onPageChange: (page: number) => void;
    onDeleteDocument: (documentId: string) => Promise<void>;
}

export default function SearchResults({
    searchResults,
    totalResults,
    totalPages,
    currentPage,
    collectionName,
    loadingDocuments,
    onPageChange,
    onDeleteDocument,
}: Readonly<SearchResultsProps>) {
    if (loadingDocuments) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
                    <Card key={i} className="border border-border/50 bg-gradient-to-br from-card via-card to-card/95 shadow-lg backdrop-blur-sm">
                        <div className="p-4">
                            <div className="flex items-center justify-between mb-4">
                                <Skeleton className="h-5 w-16" />
                                <div className="flex gap-2">
                                    <Skeleton className="h-6 w-6" />
                                    <Skeleton className="h-6 w-6" />
                                </div>
                            </div>
                        </div>
                        <CardContent className="space-y-4">
                            {/* ID field skeleton */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Skeleton className="h-3 w-3" />
                                    <Skeleton className="h-4 w-6" />
                                </div>
                                <div className="ml-5 flex items-center gap-2">
                                    <Skeleton className="h-8 flex-1" />
                                    <Skeleton className="h-6 w-6" />
                                </div>
                            </div>
                            
                            {/* Other fields skeleton */}
                            {[1, 2, 3, 4].map((j) => (
                                <div key={j} className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Skeleton className="h-3 w-3" />
                                        <Skeleton className="h-4 w-20" />
                                    </div>
                                    <div className="ml-5 flex items-center gap-2">
                                        <Skeleton className="h-8 flex-1" />
                                        <Skeleton className="h-6 w-6" />
                                    </div>
                                    <div className="ml-5 h-px bg-border"></div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    if (searchResults.length === 0) {
        return (
            <Card className="border border-border/50">
                <CardContent className="p-12 text-center">
                    <div className="space-y-4">
                        <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                            <svg
                                className="h-8 w-8 text-muted-foreground"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold">
                                No documents found
                            </h3>
                            <p className="text-muted-foreground mt-1">
                                No documents match your search criteria. Try
                                adjusting your search terms or filters.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Results Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {searchResults.map((result) => (
                    <DocumentCard
                        key={result.id}
                        result={result}
                        collectionName={collectionName}
                        onDelete={onDeleteDocument}
                    />
                ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center">
                    <PaginationComponent
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={onPageChange}
                    />
                </div>
            )}
        </div>
    );
}
