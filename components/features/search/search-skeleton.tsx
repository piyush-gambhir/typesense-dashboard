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
    <Card className="w-full flex flex-col justify-between">
        <CardContent className="p-6">
            <div className="space-y-4">
                <div className="mb-4">
                    <Skeleton className="h-4 w-16 mb-2" />
                    <Skeleton className="h-4 w-32" />
                </div>
                {[1, 2, 3].map((i) => (
                    <div key={i} className="mb-4">
                        <Skeleton className="h-4 w-20 mb-2" />
                        <Skeleton className="h-4 w-full" />
                    </div>
                ))}
            </div>
        </CardContent>
        <CardContent className="pt-4 border-t">
            <div className="flex justify-end space-x-2">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-8 w-20" />
            </div>
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
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-12">
                    {/* Filters Column */}
                    <div className="col-span-1">
                        <FilterSkeleton />
                    </div>

                    {/* Results Column */}
                    <div className="lg:col-span-4">
                        {/* Controls */}
                        <div className="flex flex-col sm:flex-row justify-end items-start sm:items-center mb-4 gap-4">
                            <Skeleton className="h-10 w-[180px]" />
                            <Skeleton className="h-10 w-[180px]" />
                        </div>

                        {/* Results Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
