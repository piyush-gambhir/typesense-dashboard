'use client';

import {
    Cpu,
    Database,
    HardDrive,
    Network,
    RefreshCw,
    Server,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { cn } from '@/utils/utils';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

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

export default function TypesenseServerMetrics({
    metrics,
    collections,
}: Readonly<{
    metrics: Record<string, string | number>;
    collections: { success: boolean; data?: Collection[]; error?: string };
}>) {
    const router = useRouter();

    const [clusterMetrics, setClusterMetrics] = useState<ServerMetrics | null>(
        null,
    );
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

    if (!clusterMetrics) {
        return (
            <div className="container mx-auto p-4">
                <Card className="border-none shadow-none">
                    <CardHeader>
                        <CardTitle>Typesense Server Status & Metrics</CardTitle>
                        <CardDescription>
                            Loading server metrics...
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex justify-center items-center h-64">
                            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container h-full overflow-hidden mx-auto">
            <Card className="border-none shadow-none">
                <CardHeader>
                    <CardTitle className="">
                        Typesense Server Status & Metrics
                    </CardTitle>
                    <CardDescription>
                        Real-time overview of your Typesense server
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {/* Server Status */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Server Status
                                </CardTitle>
                                <Server className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div
                                    className={cn(
                                        'text-2xl font-bold',
                                        clusterMetrics.status === 'online'
                                            ? 'text-green-500'
                                            : 'text-red-500',
                                    )}
                                >
                                    {clusterMetrics.status === 'online'
                                        ? 'Online'
                                        : 'Offline'}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Total Documents */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Total Documents
                                </CardTitle>
                                <Database className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {numDocuments?.toLocaleString() ?? 'N/A'}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Across {numCollections ?? 0} collections
                                </p>
                            </CardContent>
                        </Card>

                        {/* CPU Usage */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    CPU Usage
                                </CardTitle>
                                <Cpu className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {Object.values(clusterMetrics.cpuUsage)
                                        .length > 0
                                        ? (
                                              Object.values(
                                                  clusterMetrics.cpuUsage,
                                              ).reduce(
                                                  (a: number, b: number) =>
                                                      a + b,
                                                  0,
                                              ) /
                                              Object.values(
                                                  clusterMetrics.cpuUsage,
                                              ).length
                                          ).toFixed(2)
                                        : 0}
                                    %
                                </div>
                                <Progress
                                    value={
                                        Object.values(clusterMetrics.cpuUsage)
                                            .length > 0
                                            ? Object.values(
                                                  clusterMetrics.cpuUsage,
                                              ).reduce(
                                                  (a: number, b: number) =>
                                                      a + b,
                                                  0,
                                              ) /
                                              Object.values(
                                                  clusterMetrics.cpuUsage,
                                              ).length
                                            : 0
                                    }
                                    className="mt-2"
                                />
                            </CardContent>
                        </Card>

                        {/* Memory Usage */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Memory Usage
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {clusterMetrics.memoryUsage
                                        .memoryUsagePercentage || 0}
                                    %
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Used:{' '}
                                    {formatBytes(
                                        clusterMetrics.memoryUsage.usedMemory,
                                    )}{' '}
                                    / Total:{' '}
                                    {formatBytes(
                                        clusterMetrics.memoryUsage.totalMemory,
                                    )}
                                </p>
                                <Progress
                                    value={
                                        clusterMetrics.memoryUsage
                                            .memoryUsagePercentage || 0
                                    }
                                    className="mt-2"
                                />
                            </CardContent>
                        </Card>

                        {/* Disk Usage */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Disk Usage
                                </CardTitle>
                                <HardDrive className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {clusterMetrics.diskUsage.usagePercentage ||
                                        0}
                                    %
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Used:{' '}
                                    {formatBytes(clusterMetrics.diskUsage.used)}{' '}
                                    / Total:{' '}
                                    {formatBytes(
                                        clusterMetrics.diskUsage.total,
                                    )}
                                </p>
                                <Progress
                                    value={
                                        clusterMetrics.diskUsage
                                            .usagePercentage || 0
                                    }
                                    className="mt-2"
                                />
                            </CardContent>
                        </Card>

                        {/* Network Usage */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Network Usage
                                </CardTitle>
                                <Network className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    Rx:{' '}
                                    {formatBytes(
                                        clusterMetrics.networkData
                                            .receivedBytes,
                                    )}{' '}
                                    | Tx:{' '}
                                    {formatBytes(
                                        clusterMetrics.networkData.sentBytes,
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                    <Button
                        onClick={() => {
                            setIsLoading(true);
                            router.refresh();
                        }}
                        disabled={isLoading}
                    >
                        <RefreshCw
                            className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
                        />
                        {isLoading ? 'Refreshing...' : 'Refresh Metrics'}
                    </Button>
                    <p className="text-sm text-muted-foreground">
                        Last updated: {new Date().toLocaleTimeString()}
                    </p>
                </CardFooter>
            </Card>
            {error && (
                <Alert variant="destructive" className="mt-4">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
        </div>
    );
}
