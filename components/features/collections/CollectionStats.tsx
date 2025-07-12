'use client';

import {
    Activity,
    AlertCircle,
    CheckCircle,
    Clock,
    Database,
    FileText,
    Heart,
    TrendingUp,
} from 'lucide-react';
import { useEffect, useState } from 'react';

import {
    getCollectionHealth,
    getCollectionStats,
} from '@/lib/typesense/collections';

import { toast } from '@/hooks/useToast';

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
import { Skeleton } from '@/components/ui/skeleton';

interface CollectionStatsProps {
    collectionName: string;
}

interface StatsData {
    total_documents: number;
    collection_name: string;
    timestamp: string;
}

interface HealthData {
    status: 'healthy' | 'unhealthy';
    collection_name: string;
    num_documents: number;
    schema_version: number;
    timestamp: string;
}

export default function CollectionStats({
    collectionName,
}: CollectionStatsProps) {
    const [stats, setStats] = useState<StatsData | null>(null);
    const [health, setHealth] = useState<HealthData | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchData = async () => {
        try {
            const [statsResult, healthResult] = await Promise.all([
                getCollectionStats(collectionName),
                getCollectionHealth(collectionName),
            ]);

            if (statsResult.success && statsResult.data) {
                setStats(statsResult.data);
            }

            if (healthResult.success && healthResult.data) {
                setHealth(healthResult.data as HealthData);
            } else if (healthResult.data) {
                setHealth(healthResult.data as HealthData);
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to fetch collection statistics',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchData();
        setRefreshing(false);
        toast({
            title: 'Refreshed',
            description: 'Collection statistics updated',
        });
    };

    useEffect(() => {
        fetchData();
    }, [collectionName]);

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <Card key={i}>
                        <CardHeader className="pb-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-3 w-32" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-8 w-16" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Collection Statistics</h3>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefresh}
                    disabled={refreshing}
                >
                    <Activity className="h-4 w-4 mr-2" />
                    {refreshing ? 'Refreshing...' : 'Refresh'}
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Health Status */}
                <Card>
                    <CardHeader className="pb-2">
                        <div className="flex items-center space-x-2">
                            <Heart className="h-4 w-4" />
                            <CardTitle className="text-sm">
                                Health Status
                            </CardTitle>
                        </div>
                        <CardDescription>
                            Collection health check
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center space-x-2">
                            {health?.status === 'healthy' ? (
                                <CheckCircle className="h-5 w-5 text-green-500" />
                            ) : (
                                <AlertCircle className="h-5 w-5 text-red-500" />
                            )}
                            <Badge
                                variant={
                                    health?.status === 'healthy'
                                        ? 'default'
                                        : 'destructive'
                                }
                            >
                                {health?.status || 'Unknown'}
                            </Badge>
                        </div>
                    </CardContent>
                </Card>

                {/* Total Documents */}
                <Card>
                    <CardHeader className="pb-2">
                        <div className="flex items-center space-x-2">
                            <Database className="h-4 w-4" />
                            <CardTitle className="text-sm">
                                Total Documents
                            </CardTitle>
                        </div>
                        <CardDescription>Number of documents</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {stats?.total_documents?.toLocaleString() ||
                                health?.num_documents?.toLocaleString() ||
                                '0'}
                        </div>
                    </CardContent>
                </Card>

                {/* Schema Version */}
                <Card>
                    <CardHeader className="pb-2">
                        <div className="flex items-center space-x-2">
                            <FileText className="h-4 w-4" />
                            <CardTitle className="text-sm">
                                Schema Version
                            </CardTitle>
                        </div>
                        <CardDescription>Memory shards</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {health?.schema_version || 'N/A'}
                        </div>
                    </CardContent>
                </Card>

                {/* Last Updated */}
                <Card>
                    <CardHeader className="pb-2">
                        <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4" />
                            <CardTitle className="text-sm">
                                Last Updated
                            </CardTitle>
                        </div>
                        <CardDescription>Data freshness</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-sm text-muted-foreground">
                            {stats?.timestamp || health?.timestamp
                                ? new Date(
                                      stats?.timestamp ||
                                          health?.timestamp ||
                                          '',
                                  ).toLocaleString()
                                : 'N/A'}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Health Details */}
            {health && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <TrendingUp className="h-5 w-5" />
                            <span>Health Details</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">
                                    Collection Status
                                </span>
                                <Badge
                                    variant={
                                        health.status === 'healthy'
                                            ? 'default'
                                            : 'destructive'
                                    }
                                >
                                    {health.status}
                                </Badge>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">
                                    Document Count
                                </span>
                                <span className="text-sm">
                                    {health.num_documents?.toLocaleString() ||
                                        'N/A'}
                                </span>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">
                                    Memory Shards
                                </span>
                                <span className="text-sm">
                                    {health.schema_version || 'N/A'}
                                </span>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">
                                    Last Health Check
                                </span>
                                <span className="text-sm">
                                    {new Date(
                                        health.timestamp,
                                    ).toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
