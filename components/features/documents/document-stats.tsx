'use client';

import { BarChart3, FileText, Hash, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';

import { getCollection } from '@/lib/typesense/collections';
import {
    getAllDocuments,
    getDocumentCount,
    getDocumentFieldStats,
} from '@/lib/typesense/documents';

import { toast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { PageLoading, StatsGridLoading } from '@/components/ui/loading';
import { Progress } from '@/components/ui/progress';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface DocumentStatsProps {
    collectionName: string;
}

interface FieldStats {
    fieldName: string;
    totalDocuments: number;
    uniqueValues: number;
    valueDistribution: Array<{
        value: string;
        count: number;
    }>;
    topValues: Array<{
        value: string;
        count: number;
    }>;
}

export default function DocumentStats({
    collectionName,
}: Readonly<DocumentStatsProps>) {
    const [isLoading, setIsLoading] = useState(true);
    const [documentCount, setDocumentCount] = useState<number>(0);
    const [collectionFields, setCollectionFields] = useState<any[]>([]);
    const [selectedField, setSelectedField] = useState<string>('');
    const [fieldStats, setFieldStats] = useState<FieldStats | null>(null);
    const [recentDocuments, setRecentDocuments] = useState<any[]>([]);
    const [isLoadingFieldStats, setIsLoadingFieldStats] = useState(false);

    useEffect(() => {
        loadCollectionStats();
    }, [collectionName]);

    const loadCollectionStats = async () => {
        setIsLoading(true);
        try {
            const [countResult, collectionResult, recentDocsResult] =
                await Promise.all([
                    getDocumentCount(collectionName),
                    getCollection(collectionName),
                    getAllDocuments(collectionName, 5, 1, 'created_at:desc'),
                ]);

            if (countResult !== null) {
                setDocumentCount(countResult);
            }

            if (collectionResult?.success && collectionResult.data) {
                setCollectionFields(collectionResult.data.fields || []);
                if (collectionResult.data.fields?.length > 0) {
                    setSelectedField(collectionResult.data.fields[0].name);
                }
            }

            if (recentDocsResult?.success && recentDocsResult.data) {
                setRecentDocuments(
                    recentDocsResult.data.hits?.map(
                        (hit: any) => hit.document,
                    ) || [],
                );
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to load collection statistics',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const loadFieldStats = async (fieldName: string) => {
        if (!fieldName) return;

        setIsLoadingFieldStats(true);
        try {
            const statsResult = await getDocumentFieldStats(
                collectionName,
                fieldName,
            );

            if (statsResult?.success && statsResult.data) {
                setFieldStats(statsResult.data);
            } else {
                toast({
                    title: 'Error',
                    description:
                        statsResult?.error || 'Failed to load field statistics',
                    variant: 'destructive',
                });
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to load field statistics',
                variant: 'destructive',
            });
        } finally {
            setIsLoadingFieldStats(false);
        }
    };

    useEffect(() => {
        if (selectedField) {
            loadFieldStats(selectedField);
        }
    }, [selectedField, collectionName]);

    if (isLoading) {
        return (
            <div className="container mx-auto p-8 space-y-6">
                <StatsGridLoading items={3} />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4 p-6 border rounded-lg">
                        <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                        <div className="space-y-2">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="flex justify-between items-center"
                                >
                                    <div className="h-3 w-24 bg-muted animate-pulse rounded" />
                                    <div className="h-3 w-12 bg-muted animate-pulse rounded" />
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="space-y-4 p-6 border rounded-lg">
                        <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                        <div className="space-y-2">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="space-y-1">
                                    <div className="h-3 w-20 bg-muted animate-pulse rounded" />
                                    <div className="h-2 w-full bg-muted animate-pulse rounded" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">
                    Collection Statistics
                </h1>
                <p className="text-muted-foreground">
                    Detailed insights and analytics for the {collectionName}{' '}
                    collection
                </p>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border border-border/50 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total Documents
                        </CardTitle>
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <FileText className="h-4 w-4 text-primary" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-foreground">
                            {documentCount.toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            stored in {collectionName}
                        </p>
                    </CardContent>
                </Card>

                <Card className="border border-border/50 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Schema Fields
                        </CardTitle>
                        <div className="p-2 bg-blue-500/10 rounded-lg">
                            <Hash className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-foreground">
                            {collectionFields.length}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            fields configured
                        </p>
                    </CardContent>
                </Card>

                <Card className="border border-border/50 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Recent Activity
                        </CardTitle>
                        <div className="p-2 bg-green-500/10 rounded-lg">
                            <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-foreground">
                            {recentDocuments.length}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            recent documents
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Field Statistics */}
            <Card className="border border-border/50 shadow-sm">
                <CardHeader className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-purple-500/10 rounded-lg">
                            <BarChart3 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <CardTitle className="text-xl font-semibold">
                            Field Analytics
                        </CardTitle>
                    </div>
                    <CardDescription className="text-muted-foreground">
                        Deep dive into field distributions, value patterns, and
                        data quality metrics
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                    <div className="space-y-3">
                        <Label
                            htmlFor="field-select"
                            className="text-sm font-medium"
                        >
                            Analyze Field
                        </Label>
                        <Select
                            value={selectedField}
                            onValueChange={setSelectedField}
                        >
                            <SelectTrigger className="h-11">
                                <SelectValue placeholder="Choose a field to analyze" />
                            </SelectTrigger>
                            <SelectContent>
                                {collectionFields.map((field) => (
                                    <SelectItem
                                        key={field.name}
                                        value={field.name}
                                    >
                                        <div className="flex flex-col">
                                            <span className="font-medium">
                                                {field.name}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                {field.type}{' '}
                                                {field.facet
                                                    ? '• Facetable'
                                                    : ''}{' '}
                                                {field.sort ? '• Sortable' : ''}
                                            </span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {isLoadingFieldStats && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <div
                                            key={i}
                                            className="flex justify-between"
                                        >
                                            <div className="h-3 w-16 bg-muted animate-pulse rounded" />
                                            <div className="h-3 w-8 bg-muted animate-pulse rounded" />
                                        </div>
                                    ))}
                                </div>
                                <div className="space-y-2">
                                    <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                                    {Array.from({ length: 3 }).map((_, i) => (
                                        <div key={i} className="space-y-1">
                                            <div className="h-3 w-20 bg-muted animate-pulse rounded" />
                                            <div className="h-2 w-full bg-muted animate-pulse rounded" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {fieldStats && !isLoadingFieldStats && (
                        <div className="space-y-8">
                            {/* Field Overview */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="border border-border/50 rounded-lg p-6 bg-gradient-to-br from-blue-50/50 to-blue-100/50 dark:from-blue-950/20 dark:to-blue-900/20">
                                    <h4 className="font-semibold text-sm text-blue-700 dark:text-blue-300 mb-2">
                                        Total Documents
                                    </h4>
                                    <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                                        {fieldStats.totalDocuments.toLocaleString()}
                                    </p>
                                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                        documents with this field
                                    </p>
                                </div>
                                <div className="border border-border/50 rounded-lg p-6 bg-gradient-to-br from-green-50/50 to-green-100/50 dark:from-green-950/20 dark:to-green-900/20">
                                    <h4 className="font-semibold text-sm text-green-700 dark:text-green-300 mb-2">
                                        Unique Values
                                    </h4>
                                    <p className="text-3xl font-bold text-green-900 dark:text-green-100">
                                        {fieldStats.uniqueValues.toLocaleString()}
                                    </p>
                                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                                        distinct values found
                                    </p>
                                </div>
                                <div className="border border-border/50 rounded-lg p-6 bg-gradient-to-br from-purple-50/50 to-purple-100/50 dark:from-purple-950/20 dark:to-purple-900/20">
                                    <h4 className="font-semibold text-sm text-purple-700 dark:text-purple-300 mb-2">
                                        Uniqueness Ratio
                                    </h4>
                                    <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">
                                        {fieldStats.totalDocuments > 0
                                            ? Math.round(
                                                  (fieldStats.uniqueValues /
                                                      fieldStats.totalDocuments) *
                                                      100,
                                              )
                                            : 0}
                                        %
                                    </p>
                                    <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                                        data uniqueness score
                                    </p>
                                </div>
                            </div>

                            {/* Top Values Distribution */}
                            <div>
                                <h4 className="font-semibold mb-4">
                                    Top Values Distribution
                                </h4>
                                <div className="space-y-3">
                                    {fieldStats.topValues.map((item, index) => {
                                        const percentage =
                                            fieldStats.totalDocuments > 0
                                                ? (item.count /
                                                      fieldStats.totalDocuments) *
                                                  100
                                                : 0;

                                        return (
                                            <div
                                                key={index}
                                                className="space-y-2"
                                            >
                                                <div className="flex justify-between text-sm">
                                                    <span className="font-medium truncate max-w-[200px]">
                                                        {item.value ||
                                                            '(empty)'}
                                                    </span>
                                                    <span className="text-muted-foreground">
                                                        {item.count.toLocaleString()}{' '}
                                                        ({percentage.toFixed(1)}
                                                        %)
                                                    </span>
                                                </div>
                                                <Progress
                                                    value={percentage}
                                                    className="h-2"
                                                />
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Value Distribution Chart */}
                            {fieldStats.valueDistribution.length > 0 && (
                                <div>
                                    <h4 className="font-semibold mb-4">
                                        Value Distribution
                                    </h4>
                                    <div className="border rounded-lg p-4 bg-muted/50">
                                        <div className="text-sm text-muted-foreground mb-2">
                                            Showing top{' '}
                                            {fieldStats.topValues.length} of{' '}
                                            {fieldStats.uniqueValues} unique
                                            values
                                        </div>
                                        <div className="space-y-2">
                                            {fieldStats.topValues
                                                .slice(0, 10)
                                                .map((item, index) => (
                                                    <div
                                                        key={index}
                                                        className="flex items-center justify-between"
                                                    >
                                                        <span className="text-sm truncate max-w-[300px]">
                                                            {item.value ||
                                                                '(empty)'}
                                                        </span>
                                                        <div className="flex items-center space-x-2">
                                                            <div className="w-20 bg-background rounded-full h-2">
                                                                <div
                                                                    className="bg-primary h-2 rounded-full"
                                                                    style={{
                                                                        width: `${(item.count / fieldStats.totalDocuments) * 100}%`,
                                                                    }}
                                                                />
                                                            </div>
                                                            <span className="text-xs text-muted-foreground w-12 text-right">
                                                                {item.count}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Recent Documents */}
            {recentDocuments.length > 0 && (
                <Card className="border border-border/50 shadow-sm">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-xl font-semibold">
                            Recent Documents
                        </CardTitle>
                        <CardDescription className="text-muted-foreground">
                            Latest documents added to the collection
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentDocuments.map((doc, index) => (
                                <div
                                    key={index}
                                    className="border border-border/30 rounded-lg p-5 bg-gradient-to-r from-background to-muted/20 hover:shadow-sm transition-shadow"
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-primary rounded-full"></div>
                                            <h4 className="font-semibold text-foreground">
                                                {doc.id}
                                            </h4>
                                        </div>
                                        {doc.created_at && (
                                            <span className="text-xs text-muted-foreground px-2 py-1 bg-muted/50 rounded-md">
                                                {new Date(
                                                    doc.created_at,
                                                ).toLocaleDateString()}
                                            </span>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        {Object.keys(doc)
                                            .filter(
                                                (key) =>
                                                    key !== 'id' &&
                                                    key !== 'created_at',
                                            )
                                            .slice(0, 3)
                                            .map((key) => (
                                                <div
                                                    key={key}
                                                    className="flex items-start gap-2"
                                                >
                                                    <span className="text-xs font-medium text-muted-foreground min-w-0 flex-shrink-0 bg-muted/50 px-2 py-1 rounded">
                                                        {key}
                                                    </span>
                                                    <span className="text-sm text-foreground flex-1 min-w-0">
                                                        {String(
                                                            doc[key],
                                                        ).substring(0, 100)}
                                                        {String(doc[key])
                                                            .length > 100
                                                            ? '...'
                                                            : ''}
                                                    </span>
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Refresh Button */}
            <div className="flex justify-center">
                <Button onClick={loadCollectionStats} variant="outline">
                    Refresh Statistics
                </Button>
            </div>
        </div>
    );
}
