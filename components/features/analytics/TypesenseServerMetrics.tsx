'use client';

import {
    Activity,
    Cpu,
    Database,
    HardDrive,
    Network,
    RefreshCw,
    Server,
    TrendingUp,
    Zap,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { cn } from '@/lib/utils';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

type ServerMetrics = {
    status: 'online' | 'offline';
    cpuUsage: { [key: string]: number };
    diskUsage: { total: number; used: number; usagePercentage: number };
    memoryUsage: {
        totalMemory: number;
        usedMemory: number;
        memoryUsagePercentage: number;
        totalSwap: number;
        usedSwap: number;
        swapUsagePercentage: number;
    };
    networkData: { receivedBytes: number; sentBytes: number };
    typesenseMemoryMetrics: {
        activeBytes: number;
        allocatedBytes: number;
        fragmentationRatio: number;
        mappedBytes: number;
        metadataBytes: number;
        residentBytes: number;
        retainedBytes: number;
    };
};

type Collection = {
    created_at: number;
    default_sorting_field: string;
    enable_nested_fields: boolean;
    fields: unknown[];
    name: string;
    num_documents: number;
    symbols_to_index: string[];
    token_separators: string[];
};

interface MetricCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: React.ComponentType<{ className?: string }>;
    trend?: 'up' | 'down' | 'neutral';
    progress?: number;
    status?: 'success' | 'warning' | 'danger' | 'neutral';
}

function MetricCard({ 
    title, 
    value, 
    subtitle, 
    icon: Icon, 
    trend, 
    progress, 
    status = 'neutral' 
}: MetricCardProps) {
    const statusColors = {
        success: 'text-emerald-500 dark:text-emerald-400',
        warning: 'text-amber-500 dark:text-amber-400',
        danger: 'text-red-500 dark:text-red-400',
        neutral: 'text-muted-foreground'
    };

    const progressColors = {
        success: 'bg-emerald-500',
        warning: 'bg-amber-500', 
        danger: 'bg-red-500',
        neutral: 'bg-primary'
    };

    return (
        <Card className="relative overflow-hidden transition-all hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    {title}
                </CardTitle>
                <div className="flex items-center gap-2">
                    {trend && (
                        <TrendingUp className={cn(
                            "h-4 w-4",
                            trend === 'up' ? 'text-emerald-500 rotate-0' : 'text-red-500 rotate-180'
                        )} />
                    )}
                    <Icon className={cn("h-5 w-5", statusColors[status])} />
                </div>
            </CardHeader>
            <CardContent className="pb-4">
                <div className="space-y-3">
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold tracking-tight">
                            {value}
                        </span>
                        {typeof progress === 'number' && (
                            <span className="text-sm text-muted-foreground">
                                {progress.toFixed(1)}%
                            </span>
                        )}
                    </div>
                    
                    {subtitle && (
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            {subtitle}
                        </p>
                    )}
                    
                    {typeof progress === 'number' && (
                        <div className="space-y-1">
                            <Progress 
                                value={progress} 
                                className="h-2"
                                style={{
                                    '--progress-background': status === 'danger' ? 'rgb(239 68 68)' :
                                                           status === 'warning' ? 'rgb(245 158 11)' :
                                                           status === 'success' ? 'rgb(34 197 94)' :
                                                           'hsl(var(--primary))'
                                } as React.CSSProperties}
                            />
                            <div className="flex justify-between text-xs text-muted-foreground">
                                <span>Used</span>
                                <span>Available</span>
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

function MetricsSkeleton() {
    return (
        <div className="space-y-8">
            {/* Header skeleton */}
            <div className="space-y-2">
                <Skeleton className="h-8 w-80" />
                <Skeleton className="h-4 w-96" />
            </div>

            {/* Status section skeleton */}
            <div className="space-y-4">
                <Skeleton className="h-6 w-32" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Card key={i}>
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-5 w-5 rounded" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <Skeleton className="h-8 w-16" />
                                    <Skeleton className="h-3 w-full" />
                                    <Skeleton className="h-2 w-full" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Resources section skeleton */}
            <div className="space-y-4">
                <Skeleton className="h-6 w-40" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <Card key={i}>
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <Skeleton className="h-4 w-20" />
                                    <Skeleton className="h-5 w-5 rounded" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <Skeleton className="h-8 w-12" />
                                    <Skeleton className="h-3 w-full" />
                                    <Skeleton className="h-2 w-full" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default function TypesenseServerMetrics({
    metrics,
    collections,
}: Readonly<{
    metrics: Record<string, string | number>;
    collections: { success: boolean; data?: Collection[]; error?: string };
}>) {
    const router = useRouter();

    const [clusterMetrics, setClusterMetrics] = useState<ServerMetrics | null>(null);
    const [numCollections, setNumCollections] = useState<number | null>(null);
    const [numDocuments, setNumDocuments] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        try {
            if (collections?.success) {
                const collectionsData = collections.data as Collection[];
                setNumCollections(collectionsData.length);
                const totalDocs = collectionsData.reduce(
                    (acc: number, collection: Collection) => {
                        return acc + collection.num_documents;
                    },
                    0,
                );
                setNumDocuments(totalDocs);
            } else if (collections?.success === false) {
                setError(`Failed to fetch collections: ${collections.error}`);
            }

            if (metrics) {
                const metricsData = metrics;

                // Step 1: Dynamically create `cpuUsage` object
                const cpuUsage = Object.keys(metricsData)
                    .filter(
                        (key) =>
                            key.startsWith('system_cpu') &&
                            key.endsWith('_active_percentage'),
                    )
                    .reduce((acc: Record<string, number>, key: string) => {
                        const cpuName = key.replace('system_', '');
                        acc[cpuName] = parseFloat(String(metricsData[key]));
                        return acc;
                    }, {});

                // Step 2: Calculate Disk Usage
                const totalDisk = parseFloat(
                    String(metricsData.system_disk_total_bytes),
                );
                const usedDisk = parseFloat(
                    String(metricsData.system_disk_used_bytes),
                );
                const diskUsage = {
                    total: totalDisk,
                    used: usedDisk,
                    usagePercentage: parseFloat(
                        ((usedDisk / totalDisk) * 100).toFixed(2),
                    ),
                };

                // Step 3: Calculate Memory Usage
                const totalMemory = parseFloat(
                    String(metricsData.system_memory_total_bytes),
                );
                const usedMemory = parseFloat(
                    String(metricsData.system_memory_used_bytes),
                );
                const totalSwap = parseFloat(
                    String(metricsData.system_memory_total_swap_bytes),
                );
                const usedSwap = parseFloat(
                    String(metricsData.system_memory_used_swap_bytes),
                );
                const memoryUsage = {
                    totalMemory,
                    usedMemory,
                    memoryUsagePercentage: parseFloat(
                        ((usedMemory / totalMemory) * 100).toFixed(2),
                    ),
                    totalSwap,
                    usedSwap,
                    swapUsagePercentage:
                        totalSwap > 0
                            ? parseFloat(
                                  ((usedSwap / totalSwap) * 100).toFixed(2),
                              )
                            : 0,
                };

                // Step 4: Calculate Network Data
                const networkData = {
                    receivedBytes: parseInt(
                        String(metricsData.system_network_received_bytes),
                        10,
                    ),
                    sentBytes: parseInt(
                        String(metricsData.system_network_sent_bytes),
                        10,
                    ),
                };

                // Step 5: Handle Typesense-specific Memory Metrics
                const typesenseMemoryMetrics = {
                    activeBytes: parseInt(
                        String(metricsData.typesense_memory_active_bytes),
                        10,
                    ),
                    allocatedBytes: parseInt(
                        String(metricsData.typesense_memory_allocated_bytes),
                        10,
                    ),
                    fragmentationRatio: parseFloat(
                        String(
                            metricsData.typesense_memory_fragmentation_ratio,
                        ),
                    ),
                    mappedBytes: parseInt(
                        String(metricsData.typesense_memory_mapped_bytes),
                        10,
                    ),
                    metadataBytes: parseInt(
                        String(metricsData.typesense_memory_metadata_bytes),
                        10,
                    ),
                    residentBytes: parseInt(
                        String(metricsData.typesense_memory_resident_bytes),
                        10,
                    ),
                    retainedBytes: parseInt(
                        String(metricsData.typesense_memory_retained_bytes),
                        10,
                    ),
                };

                setClusterMetrics({
                    status: 'online',
                    cpuUsage,
                    diskUsage,
                    memoryUsage,
                    networkData,
                    typesenseMemoryMetrics,
                });
            }
        } catch {
            setError('Failed to process metrics data.');
        }
    }, [metrics, collections]);

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getCpuAverage = () => {
        if (!clusterMetrics || Object.values(clusterMetrics.cpuUsage).length === 0) return 0;
        return Object.values(clusterMetrics.cpuUsage).reduce((a, b) => a + b, 0) / 
               Object.values(clusterMetrics.cpuUsage).length;
    };

    const getUsageStatus = (percentage: number): 'success' | 'warning' | 'danger' => {
        if (percentage < 60) return 'success';
        if (percentage < 80) return 'warning';
        return 'danger';
    };

    if (!clusterMetrics) {
        return (
            <div className="container mx-auto px-4 py-8">
                <MetricsSkeleton />
            </div>
        );
    }

    const avgCpu = getCpuAverage();
    const memoryPercent = clusterMetrics.memoryUsage.memoryUsagePercentage || 0;
    const diskPercent = clusterMetrics.diskUsage.usagePercentage || 0;

    return (
        <div className="container mx-auto px-4 py-8 space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">
                        Server Metrics
                    </h1>
                    <p className="text-muted-foreground">
                        Real-time overview of your Typesense server performance
                    </p>
                </div>
                <Button
                    onClick={() => {
                        setIsLoading(true);
                        router.refresh();
                    }}
                    disabled={isLoading}
                    className="gap-2"
                >
                    <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
                    {isLoading ? 'Refreshing...' : 'Refresh'}
                </Button>
            </div>

            {error && (
                <Alert variant="destructive">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {/* Status Overview */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <h2 className="text-xl font-semibold">Status Overview</h2>
                    <Badge 
                        variant={clusterMetrics.status === 'online' ? 'default' : 'destructive'}
                        className="gap-1"
                    >
                        <div className={cn(
                            "w-2 h-2 rounded-full",
                            clusterMetrics.status === 'online' 
                                ? "bg-emerald-500 animate-pulse" 
                                : "bg-red-500"
                        )} />
                        {clusterMetrics.status === 'online' ? 'Online' : 'Offline'}
                    </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <MetricCard
                        title="Server Status"
                        value={clusterMetrics.status === 'online' ? 'Online' : 'Offline'}
                        icon={Server}
                        status={clusterMetrics.status === 'online' ? 'success' : 'danger'}
                        subtitle="Typesense server operational status"
                    />

                    <MetricCard
                        title="Total Collections"
                        value={numCollections?.toLocaleString() ?? 'N/A'}
                        icon={Database}
                        status="neutral"
                        subtitle="Active collections in your instance"
                    />

                    <MetricCard
                        title="Total Documents"
                        value={numDocuments?.toLocaleString() ?? 'N/A'}
                        icon={Activity}
                        status="neutral"
                        subtitle={`Across ${numCollections ?? 0} collections`}
                    />

                    <MetricCard
                        title="Memory Efficiency"
                        value={`${(100 - clusterMetrics.typesenseMemoryMetrics.fragmentationRatio * 100).toFixed(1)}%`}
                        icon={Zap}
                        status={clusterMetrics.typesenseMemoryMetrics.fragmentationRatio < 0.2 ? 'success' : 'warning'}
                        subtitle="Typesense memory optimization"
                    />
                </div>
            </div>

            <Separator />

            {/* Resource Usage */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold">Resource Usage</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <MetricCard
                        title="CPU Usage"
                        value={`${avgCpu.toFixed(1)}%`}
                        icon={Cpu}
                        progress={avgCpu}
                        status={getUsageStatus(avgCpu)}
                        subtitle={`Average across ${Object.keys(clusterMetrics.cpuUsage).length} cores`}
                    />

                    <MetricCard
                        title="Memory Usage"
                        value={`${memoryPercent.toFixed(1)}%`}
                        icon={Database}
                        progress={memoryPercent}
                        status={getUsageStatus(memoryPercent)}
                        subtitle={`${formatBytes(clusterMetrics.memoryUsage.usedMemory)} / ${formatBytes(clusterMetrics.memoryUsage.totalMemory)}`}
                    />

                    <MetricCard
                        title="Disk Usage"
                        value={`${diskPercent.toFixed(1)}%`}
                        icon={HardDrive}
                        progress={diskPercent}
                        status={getUsageStatus(diskPercent)}
                        subtitle={`${formatBytes(clusterMetrics.diskUsage.used)} / ${formatBytes(clusterMetrics.diskUsage.total)}`}
                    />
                </div>
            </div>

            <Separator />

            {/* Network & Typesense Memory */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold">Advanced Metrics</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Network className="h-5 w-5" />
                                Network Activity
                            </CardTitle>
                            <CardDescription>
                                Total bytes transferred since startup
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-muted-foreground">Received</p>
                                    <p className="text-2xl font-bold">
                                        {formatBytes(clusterMetrics.networkData.receivedBytes)}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-muted-foreground">Sent</p>
                                    <p className="text-2xl font-bold">
                                        {formatBytes(clusterMetrics.networkData.sentBytes)}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Zap className="h-5 w-5" />
                                Typesense Memory
                            </CardTitle>
                            <CardDescription>
                                Internal memory allocation details
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Active:</span>
                                        <span className="font-medium">
                                            {formatBytes(clusterMetrics.typesenseMemoryMetrics.activeBytes)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Allocated:</span>
                                        <span className="font-medium">
                                            {formatBytes(clusterMetrics.typesenseMemoryMetrics.allocatedBytes)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Resident:</span>
                                        <span className="font-medium">
                                            {formatBytes(clusterMetrics.typesenseMemoryMetrics.residentBytes)}
                                        </span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Mapped:</span>
                                        <span className="font-medium">
                                            {formatBytes(clusterMetrics.typesenseMemoryMetrics.mappedBytes)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Metadata:</span>
                                        <span className="font-medium">
                                            {formatBytes(clusterMetrics.typesenseMemoryMetrics.metadataBytes)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Retained:</span>
                                        <span className="font-medium">
                                            {formatBytes(clusterMetrics.typesenseMemoryMetrics.retainedBytes)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-center pt-4">
                <p className="text-sm text-muted-foreground">
                    Last updated: {new Date().toLocaleTimeString()}
                </p>
            </div>
        </div>
    );
}