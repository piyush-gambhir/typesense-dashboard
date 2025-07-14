import React from 'react';

import SearchPresets from '@/components/features/search/search-presets';

export default function SearchPresetsPage() {
    return (
        <div className="container mx-auto px-4 py-8 space-y-8">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold">Search Presets</h1>
                <p className="text-muted-foreground">
                    Create and manage global search overrides that apply across all collections
                </p>
            </div>
            <SearchPresets />
        </div>
    );
}