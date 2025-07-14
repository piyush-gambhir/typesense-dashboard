'use client';

import { Database, FileText, Hash } from 'lucide-react';

import { Badge } from '@/components/ui/badge';

interface CollectionHeaderProps {
    name: string;
    numDocuments: number;
    fieldsCount: number;
    createdAt: number;
}

export default function CollectionHeader({
    name,
    numDocuments,
    fieldsCount,
    createdAt,
}: Readonly<CollectionHeaderProps>) {
    // Handle edge cases
    const safeNumDocuments =
        typeof numDocuments === 'number' ? numDocuments : 0;
    const safeFieldsCount = typeof fieldsCount === 'number' ? fieldsCount : 0;
    const safeName = name || 'Unknown Collection';

    return (
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-3">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl ring-1 ring-primary/20 shadow-sm">
                        <Database className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight break-words">
                            {safeName}
                        </h1>
                        <p className="text-muted-foreground">
                            Collection overview and schema management
                        </p>
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="secondary" className="gap-1 shadow-sm">
                    <FileText className="h-3 w-3" />
                    {safeNumDocuments.toLocaleString()} documents
                </Badge>
                <Badge variant="outline" className="gap-1 shadow-sm">
                    <Hash className="h-3 w-3" />
                    {safeFieldsCount} fields
                </Badge>
            </div>
        </div>
    );
}
