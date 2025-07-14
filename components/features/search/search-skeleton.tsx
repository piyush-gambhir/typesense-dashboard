'use client';

import React from 'react';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const FilterSkeleton = () => (
    <div className="space-y-6">
        {[1, 2, 3].map((i) => (
            <div key={i} className="border-b last:border-b-0 pb-4">
                <Skeleton className="h-6 w-32 mb-4" />
                <div className="space-y-3">
                    {[1, 2, 3, 4].map((j) => (
                        <div key={j} className="flex items-center space-x-2">
                            <Skeleton className="h-4 w-4" />
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-8" />
                        </div>
                    ))}
                </div>
            </div>
        ))}
    </div>
);

const DocumentCardSkeleton = () => (
    <Card className="border border-border/50 bg-gradient-to-br from-card via-card to-card/95 shadow-lg backdrop-blur-sm">
        <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <Skeleton className="h-5 w-16" />
                </div>
                <div className="flex items-center gap-2">
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-8" />
                </div>
            </div>
        </CardHeader>
        <CardContent className="space-y-4">
            {/* ID field skeleton */}
            <div className="space-y-2">
                <div className="flex items-center gap-2">
                    <Skeleton className="h-3 w-3" />
                    <Skeleton className="h-4 w-6" />
                </div>
                <div className="ml-5 flex items-center gap-2">
                    <Skeleton className="h-8 flex-1" />
                    <Skeleton className="h-8 w-8" />
                </div>
            </div>
            
            {/* Other fields skeleton */}
            {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-2">
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-3 w-3" />
                        <Skeleton className="h-4 w-20" />
                    </div>
                    <div className="ml-5 flex items-center gap-2">
                        <Skeleton className="h-8 flex-1" />
                        <Skeleton className="h-8 w-8" />
                    </div>
                    <div className="mt-4 ml-5 h-px bg-border"></div>
                </div>
            ))}
        </CardContent>
    </Card>
);

const SearchSkeleton = () => (
    <div className="p-4 md:p-8 flex flex-col gap-y-4">
        <Card className="border-none shadow-none">
            <CardHeader>
                <Skeleton className="h-6 md:h-8 w-36 md:w-48" />
                <Skeleton className="h-3 md:h-4 w-48 md:w-64" />
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Filters Column */}
                    <div className="col-span-1">
                        <FilterSkeleton />
                    </div>

                    {/* Results Column */}
                    <div className="lg:col-span-3">
                        {/* Controls */}
                        <div className="flex flex-col sm:flex-row justify-end items-start sm:items-center mb-4 gap-4">
                            <Skeleton className="h-10 w-[180px]" />
                            <Skeleton className="h-10 w-[180px]" />
                        </div>

                        {/* Results Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <DocumentCardSkeleton key={i} />
                            ))}
                        </div>

                        {/* Pagination */}
                        <div className="mt-6 flex justify-center">
                            <div className="flex items-center space-x-2">
                                <Skeleton className="h-8 w-8" />
                                <Skeleton className="h-8 w-8" />
                                <Skeleton className="h-8 w-8" />
                                <Skeleton className="h-8 w-8" />
                                <Skeleton className="h-8 w-8" />
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    </div>
);

export default SearchSkeleton;
