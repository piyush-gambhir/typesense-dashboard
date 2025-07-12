'use client';

import {
    Activity,
    Calendar,
    Database,
    Download,
    FileText,
    Hash,
    Import,
    Search,
    Settings,
    TrendingUp,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';

import { convertUnixTimestamp } from '@/utils/date-time';
import { cn } from '@/lib/utils';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

import CreateCollectionDialog from '@/components/features/collections/CreateCollectionDialog';
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
    onImport: (name: string) => void;
    onExport: (name: string) => void;
}

function CollectionCard({ collection, onViewDetails, onImport, onExport }: CollectionCardProps) {
    const { date } = convertUnixTimestamp(collection.created_at);
    
    const getDocumentCountStatus = (count: number) => {
        if (count === 0) return { status: 'empty', color: 'text-muted-foreground', bg: 'bg-muted/30' };
        if (count < 1000) return { status: 'small', color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' };
        if (count < 100000) return { status: 'medium', color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' };
        return { status: 'large', color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' };
    };

    const documentStatusInfo = getDocumentCountStatus(collection.num_documents);
    const daysOld = Math.ceil((Date.now() - collection.created_at * 1000) / (1000 * 60 * 60 * 24));
    
    return (
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-card via-card to-card/95 shadow-lg backdrop-blur-sm">
            <CardHeader className="relative pb-6 pt-6">
                <div className="flex items-start gap-4">
                    <div className="relative">
                        <div className="flex-shrink-0 p-4 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl ring-1 ring-primary/20 shadow-lg backdrop-blur-sm">
                            <Database className="h-6 w-6 text-primary" />
                        </div>
                    </div>
                    <div className="min-w-0 flex-1 space-y-2">
                        <CardTitle className="text-xl font-bold tracking-tight line-clamp-2">
                            {collection.name}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs font-medium bg-muted/60">
                                Collection
                            </Badge>
                            <Badge 
                                variant="outline" 
                                className={cn(
                                    "text-xs font-medium border",
                                    documentStatusInfo.bg,
                                    documentStatusInfo.color
                                )}
                            >
                                {documentStatusInfo.status.charAt(0).toUpperCase() + documentStatusInfo.status.slice(1)}
                            </Badge>
                        </div>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="relative space-y-6 pb-6">
                {/* Enhanced Stats Grid */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl bg-gradient-to-br from-background/50 to-background/30 border border-border/50">
                        <div className="space-y-3">
                            <div className="flex items-center justify-center">
                                <div className="p-2 rounded-lg bg-blue-500/10 ring-1 ring-blue-500/20">
                                    <FileText className="h-4 w-4 text-blue-600" />
                                </div>
                            </div>
                            <div className="text-center space-y-1">
                                <div className="text-xl font-bold tracking-tight">
                                    {collection.num_documents.toLocaleString()}
                                </div>
                                <div className="text-xs font-medium text-muted-foreground">Documents</div>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 rounded-xl bg-gradient-to-br from-background/50 to-background/30 border border-border/50">
                        <div className="space-y-3">
                            <div className="flex items-center justify-center">
                                <div className="p-2 rounded-lg bg-purple-500/10 ring-1 ring-purple-500/20">
                                    <Hash className="h-4 w-4 text-purple-600" />
                                </div>
                            </div>
                            <div className="text-center space-y-1">
                                <div className="text-xl font-bold tracking-tight">
                                    {collection.fields?.length || 0}
                                </div>
                                <div className="text-xs font-medium text-muted-foreground">Fields</div>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 rounded-xl bg-gradient-to-br from-background/50 to-background/30 border border-border/50">
                        <div className="space-y-3">
                            <div className="flex items-center justify-center">
                                <div className="p-2 rounded-lg bg-amber-500/10 ring-1 ring-amber-500/20">
                                    <Calendar className="h-4 w-4 text-amber-600" />
                                </div>
                            </div>
                            <div className="text-center space-y-1">
                                <div className="text-xl font-bold tracking-tight">
                                    {daysOld}
                                </div>
                                <div className="text-xs font-medium text-muted-foreground">Days Old</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Enhanced Actions */}
                <div className="space-y-4">
                    {/* Primary Actions */}
                    <div className="flex gap-3">
                        <Link href={`/collections/${collection.name}/search`} className="flex-1">
                            <Button className="w-full gap-2 bg-gradient-to-r from-primary to-primary/90 shadow-lg font-medium">
                                <Search className="h-4 w-4" />
                                Search Collection
                            </Button>
                        </Link>
                        <Button
                            variant="outline"
                            className="flex-1 gap-2 bg-background/60 backdrop-blur-sm border-border/60 shadow-sm font-medium"
                            onClick={() => onViewDetails(collection.name)}
                        >
                            <Settings className="h-4 w-4" />
                            Manage
                        </Button>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="flex-1 gap-2 text-muted-foreground"
                            onClick={() => onImport(collection.name)}
                        >
                            <Import className="h-4 w-4" />
                            Import
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="flex-1 gap-2 text-muted-foreground"
                            onClick={() => onExport(collection.name)}
                        >
                            <Download className="h-4 w-4" />
                            Export
                        </Button>
                    </div>
                </div>

                {/* Collection metadata */}
                <div className="pt-2 border-t border-border/50">
                    <div className="flex items-center justify-center text-xs text-muted-foreground">
                        <span>Created {date}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function CollectionCardSkeleton() {
    return (
        <Card className="overflow-hidden border-0 bg-gradient-to-br from-card via-card to-card/95 shadow-lg">
            <CardHeader className="pb-6 pt-6">
                <div className="flex items-start gap-4">
                    <div className="relative">
                        <Skeleton className="h-14 w-14 rounded-2xl" />
                    </div>
                    <div className="min-w-0 flex-1 space-y-3">
                        <Skeleton className="h-6 w-40" />
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-5 w-16 rounded-full" />
                            <Skeleton className="h-5 w-12 rounded-full" />
                        </div>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-6 pb-6">
                {/* Stats Grid Skeleton */}
                <div className="grid grid-cols-3 gap-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="p-4 rounded-xl border border-border/50 space-y-3">
                            <div className="flex items-center justify-center">
                                <Skeleton className="h-8 w-8 rounded-lg" />
                            </div>
                            <div className="text-center space-y-1">
                                <Skeleton className="h-6 w-12 mx-auto" />
                                <Skeleton className="h-3 w-16 mx-auto" />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Actions Skeleton */}
                <div className="space-y-4">
                    <div className="flex gap-3">
                        <Skeleton className="h-10 flex-1" />
                        <Skeleton className="h-10 flex-1" />
                    </div>
                    <div className="flex gap-2">
                        <Skeleton className="h-8 flex-1" />
                        <Skeleton className="h-8 flex-1" />
                    </div>
                </div>

                {/* Footer Skeleton */}
                <div className="pt-2 border-t border-border/50">
                    <div className="flex items-center justify-center">
                        <Skeleton className="h-3 w-20" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function StatsOverview({ collections }: { collections: ReadonlyArray<Collection> }) {
    const stats = useMemo(() => {
        const totalDocuments = collections.reduce((sum, col) => sum + col.num_documents, 0);
        const totalFields = collections.reduce((sum, col) => sum + (col.fields?.length || 0), 0);
        const avgDocuments = collections.length > 0 ? Math.round(totalDocuments / collections.length) : 0;
        const emptyCollections = collections.filter(col => col.num_documents === 0).length;

        return {
            totalCollections: collections.length,
            totalDocuments,
            totalFields,
            avgDocuments,
            emptyCollections,
        };
    }, [collections]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <Card className="border border-border/50">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total Collections
                        </CardTitle>
                        <Database className="h-5 w-5 text-primary" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold tracking-tight">
                        {stats.totalCollections.toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                        Active collections
                    </p>
                </CardContent>
            </Card>

            <Card className="border border-border/50">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total Documents
                        </CardTitle>
                        <FileText className="h-5 w-5 text-emerald-500" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold tracking-tight">
                        {stats.totalDocuments.toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                        Across all collections
                    </p>
                </CardContent>
            </Card>

            <Card className="border border-border/50">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total Fields
                        </CardTitle>
                        <Hash className="h-5 w-5 text-blue-500" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold tracking-tight">
                        {stats.totalFields.toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                        Schema fields defined
                    </p>
                </CardContent>
            </Card>

            <Card className="border border-border/50">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Avg. Documents
                        </CardTitle>
                        <TrendingUp className="h-5 w-5 text-amber-500" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold tracking-tight">
                        {stats.avgDocuments.toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                        Per collection
                    </p>
                </CardContent>
            </Card>

            <Card className="border border-border/50">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Empty Collections
                        </CardTitle>
                        <Activity className="h-5 w-5 text-red-500" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold tracking-tight">
                        {stats.emptyCollections}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                        No documents yet
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}

function EmptyState() {
    return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center space-y-6 max-w-md">
                <div className="mx-auto w-20 h-20 bg-muted rounded-2xl flex items-center justify-center ring-1 ring-border">
                    <Database className="h-10 w-10 text-muted-foreground" />
                </div>
                <div className="space-y-3">
                    <h3 className="text-2xl font-semibold tracking-tight">
                        No collections found
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                        Get started by creating your first collection to store and search your data.
                        Collections are the foundation of your search experience.
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

    const handleImport = (name: string) => {
        router.push(`/collections/${name}/documents/import`);
    };

    const handleExport = (name: string) => {
        router.push(`/collections/${name}/documents/export`);
    };

    if (!collections || collections.length === 0) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="space-y-8">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="space-y-2">
                            <h1 className="text-3xl font-bold tracking-tight">Collections</h1>
                            <p className="text-muted-foreground">
                                Manage your Typesense collections and their configurations
                            </p>
                        </div>
                    </div>

                    <EmptyState />
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">Collections</h1>
                    <p className="text-muted-foreground">
                        Manage your Typesense collections and their configurations
                    </p>
                </div>
                <CreateCollectionDialog />
            </div>

            {/* Stats Overview */}
            <StatsOverview collections={collections} />

            <Separator />

            {/* Collections Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {collections.map((collection) => (
                    <CollectionCard
                        key={collection.name}
                        collection={collection}
                        onViewDetails={handleViewDetails}
                        onImport={handleImport}
                        onExport={handleExport}
                    />
                ))}
            </div>
        </div>
    );
}