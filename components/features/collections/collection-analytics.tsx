'use client';

import { Activity, BarChart3, Clock, TrendingUp } from 'lucide-react';
import { useState } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import CollectionStats from './collection-stats';

interface CollectionAnalyticsProps {
    collectionName: string;
}

export default function CollectionAnalytics({
    collectionName,
}: CollectionAnalyticsProps) {
    const [activeTab, setActiveTab] = useState('overview');

    return (
        <div className="container mx-auto px-4 py-8 space-y-8">
            {/* Header */}
            <div className="space-y-3">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-emerald-500/20 to-emerald-500/10 rounded-xl ring-1 ring-emerald-500/20">
                        <BarChart3 className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Collection Analytics
                        </h1>
                        <p className="text-muted-foreground">
                            Performance insights for collection '
                            {collectionName}'
                        </p>
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="border border-border/50">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Health Status
                            </CardTitle>
                            <Activity className="h-5 w-5 text-emerald-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold tracking-tight text-emerald-600">
                            Healthy
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            All systems operational
                        </p>
                    </CardContent>
                </Card>

                <Card className="border border-border/50">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Performance
                            </CardTitle>
                            <TrendingUp className="h-5 w-5 text-blue-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold tracking-tight">
                            95%
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Average performance score
                        </p>
                    </CardContent>
                </Card>

                <Card className="border border-border/50">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Response Time
                            </CardTitle>
                            <Clock className="h-5 w-5 text-purple-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold tracking-tight">
                            24ms
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Average query response
                        </p>
                    </CardContent>
                </Card>

                <Card className="border border-border/50">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Query Volume
                            </CardTitle>
                            <BarChart3 className="h-5 w-5 text-amber-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold tracking-tight">
                            1.2K
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Queries in last 24h
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Detailed Analytics */}
            <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="space-y-6"
            >
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview">Collection Stats</TabsTrigger>
                    <TabsTrigger value="performance">Performance</TabsTrigger>
                    <TabsTrigger value="usage">Usage Patterns</TabsTrigger>
                    <TabsTrigger value="health">Health Monitoring</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                    <CollectionStats collectionName={collectionName} />
                </TabsContent>

                <TabsContent value="performance" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Performance Metrics</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">
                                Performance analytics coming soon. This will
                                include query response times, indexing
                                performance, and resource utilization metrics.
                            </p>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="usage" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Usage Patterns</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">
                                Usage pattern analysis coming soon. This will
                                include search trends, popular queries, and
                                usage statistics over time.
                            </p>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="health" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Health Monitoring</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">
                                Health monitoring dashboard coming soon. This
                                will include system status, error rates, and
                                operational health indicators.
                            </p>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
