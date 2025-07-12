'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import DocumentCard from '@/components/features/documents/DocumentCard';
import PaginationComponent from '@/components/common/Pagination';

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
            <div className="space-y-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Card key={i} className="border border-border/50">
                        <CardContent className="p-6">
                            <div className="space-y-4 animate-pulse">
                                <div className="h-4 bg-muted rounded w-3/4"></div>
                                <div className="space-y-2">
                                    <div className="h-3 bg-muted rounded"></div>
                                    <div className="h-3 bg-muted rounded w-5/6"></div>
                                </div>
                            </div>
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
                            <svg className="h-8 w-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold">No documents found</h3>
                            <p className="text-muted-foreground mt-1">
                                No documents match your search criteria. Try adjusting your search terms or filters.
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
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
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