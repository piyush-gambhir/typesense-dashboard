'use client';

import {
    Calendar,
    Database,
    FileText,
    Hash,
    Search,
    Settings,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';

import { cn } from '@/lib/utils';
import { convertUnixTimestamp } from '@/utils/date-time';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

import CreateCollectionDialog from '@/components/features/collections/create-collection-dialog';
import Link from '@/components/link';

interface Collection {
    name: string;
    created_at: number;
    num_documents: number;
    fields: Array<{ name: string; type: string }>;
}

interface CollectionCardProps {
    collection: Collection;
    onViewDetails: (name: string) => void;
}

function CollectionCard({ collection, onViewDetails }: CollectionCardProps) {
    const { date } = convertUnixTimestamp(collection.created_at);

    const getDocumentCountStatus = (count: number) => {
        if (count === 0)
            return {
                status: 'empty',
                color: 'text-muted-foreground',
                bg: 'bg-muted/30',
            };
        if (count < 1000)
            return {
                status: 'small',
                color: 'text-amber-600',
                bg: 'bg-amber-50 border-amber-200',
            };
        if (count < 100000)
            return {
                status: 'medium',
                color: 'text-blue-600',
                bg: 'bg-blue-50 border-blue-200',
            };
        return {
            status: 'large',
            color: 'text-emerald-600',
            bg: 'bg-emerald-50 border-emerald-200',
        };
    };

    const documentStatusInfo = getDocumentCountStatus(collection.num_documents);
    const daysOld = Math.ceil(
        (Date.now() - collection.created_at * 1000) / (1000 * 60 * 60 * 24),
    );

    return (
        <Card className="group relative overflow-hidden border-border/50 hover:border-border transition-colors duration-150">
            <CardHeader className="relative pb-3 pt-4">
                <div className="flex items-start gap-3">
                    <Database className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <div className="min-w-0 flex-1 space-y-1">
                        <CardTitle className="text-sm font-medium tracking-tight line-clamp-1">
                            {collection.name}
                        </CardTitle>
                        <p className="text-[11px] text-muted-foreground">
                            Created {date}
                        </p>
                    </div>
                    <Badge
                        variant="outline"
                        className={cn(
                            'text-[10px] font-medium h-5 px-1.5 border shrink-0',
                            documentStatusInfo.bg,
                            documentStatusInfo.color,
                        )}
                    >
                        {documentStatusInfo.status.charAt(0).toUpperCase() +
                            documentStatusInfo.status.slice(1)}
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="relative space-y-3 pb-4">
                {/* Stats — flat inline row, no sub-cards */}
                <div className="flex items-center gap-4 text-xs text-muted-foreground border-t border-border/40 pt-3">
                    <div className="flex items-center gap-1.5">
                        <FileText className="h-3 w-3 text-muted-foreground/60" />
                        <span className="font-medium text-foreground">
                            {collection.num_documents.toLocaleString()}
                        </span>
                        <span>docs</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Hash className="h-3 w-3 text-muted-foreground/60" />
                        <span className="font-medium text-foreground">
                            {collection.fields?.length || 0}
                        </span>
                        <span>fields</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Calendar className="h-3 w-3 text-muted-foreground/60" />
                        <span className="font-medium text-foreground">
                            {daysOld}d
                        </span>
                        <span>old</span>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                    <Link
                        href={`/collections/${collection.name}/search`}
                        className="flex-1"
                    >
                        <Button
                            className="w-full gap-1.5 h-8 text-xs font-medium"
                            size="sm"
                        >
                            <Search className="h-3 w-3" />
                            Search
                        </Button>
                    </Link>
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 gap-1.5 h-8 text-xs font-medium"
                        onClick={() => onViewDetails(collection.name)}
                    >
                        <Settings className="h-3 w-3" />
                        Manage
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

function CollectionCardSkeleton() {
    return (
        <Card className="overflow-hidden border-border/50">
            <CardHeader className="pb-3 pt-4">
                <div className="flex items-start gap-3">
                    <Skeleton className="h-4 w-4 rounded-sm" />
                    <div className="min-w-0 flex-1 space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-20" />
                    </div>
                    <Skeleton className="h-5 w-12 rounded-sm" />
                </div>
            </CardHeader>
            <CardContent className="space-y-3 pb-4">
                <div className="border-t border-border/40 pt-3">
                    <Skeleton className="h-3 w-48" />
                </div>
                <div className="flex gap-2">
                    <Skeleton className="h-8 flex-1" />
                    <Skeleton className="h-8 flex-1" />
                </div>
            </CardContent>
        </Card>
    );
}

function StatsOverview({
    collections,
}: {
    collections: ReadonlyArray<Collection>;
}) {
    const stats = useMemo(() => {
        const totalDocuments = collections.reduce(
            (sum, col) => sum + col.num_documents,
            0,
        );
        const totalFields = collections.reduce(
            (sum, col) => sum + (col.fields?.length || 0),
            0,
        );
        const avgDocuments =
            collections.length > 0
                ? Math.round(totalDocuments / collections.length)
                : 0;
        const emptyCollections = collections.filter(
            (col) => col.num_documents === 0,
        ).length;

        return {
            totalCollections: collections.length,
            totalDocuments,
            totalFields,
            avgDocuments,
            emptyCollections,
        };
    }, [collections]);

    return (
        <div className="flex items-center gap-0 border border-border/50 rounded-lg divide-x divide-border/50 overflow-hidden">
            <div className="flex-1 px-4 py-3">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">
                    Collections
                </p>
                <p className="text-lg font-semibold tracking-tight">
                    {stats.totalCollections.toLocaleString()}
                </p>
            </div>
            <div className="flex-1 px-4 py-3">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">
                    Documents
                </p>
                <p className="text-lg font-semibold tracking-tight">
                    {stats.totalDocuments.toLocaleString()}
                </p>
            </div>
            <div className="flex-1 px-4 py-3">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">
                    Fields
                </p>
                <p className="text-lg font-semibold tracking-tight">
                    {stats.totalFields.toLocaleString()}
                </p>
            </div>
            <div className="flex-1 px-4 py-3">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">
                    Avg. Docs
                </p>
                <p className="text-lg font-semibold tracking-tight">
                    {stats.avgDocuments.toLocaleString()}
                </p>
            </div>
            <div className="flex-1 px-4 py-3">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">
                    Empty
                </p>
                <p className="text-lg font-semibold tracking-tight">
                    {stats.emptyCollections}
                </p>
            </div>
        </div>
    );
}

function EmptyState() {
    return (
        <div className="flex items-center justify-center min-h-[360px]">
            <div className="text-center space-y-3 max-w-xs">
                <Database className="h-6 w-6 text-muted-foreground/40 mx-auto" />
                <div className="space-y-1">
                    <h3 className="text-sm font-medium">No collections</h3>
                    <p className="text-xs text-muted-foreground">
                        Create your first collection to get started.
                    </p>
                </div>
                <CreateCollectionDialog />
            </div>
        </div>
    );
}

export default function TypesenseCollections({
    collections,
}: {
    collections: ReadonlyArray<Collection>;
}) {
    const router = useRouter();

    const handleViewDetails = (name: string) => {
        router.push(`/collections/${name}`);
    };

    if (!collections || collections.length === 0) {
        return (
            <div className="container mx-auto px-6 py-6">
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h1 className="text-2xl font-semibold">
                                Collections
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                Manage your Typesense collections
                            </p>
                        </div>
                    </div>

                    <EmptyState />
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-6 py-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h1 className="text-2xl font-semibold">Collections</h1>
                    <p className="text-sm text-muted-foreground">
                        Manage your Typesense collections
                    </p>
                </div>
                <CreateCollectionDialog />
            </div>

            {/* Stats Overview */}
            <StatsOverview collections={collections} />

            <Separator className="bg-border/40" />

            {/* Collections Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {collections.map((collection) => (
                    <CollectionCard
                        key={collection.name}
                        collection={collection}
                        onViewDetails={handleViewDetails}
                    />
                ))}
            </div>
        </div>
    );
}
