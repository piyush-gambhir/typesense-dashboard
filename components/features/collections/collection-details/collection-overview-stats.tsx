'use client';

import { Calendar, FileText, Hash, Settings } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';

interface CollectionOverviewStatsProps {
    numDocuments: number;
    fieldsCount: number;
    createdAt: number;
    enableNestedFields?: boolean;
    defaultSortingField?: string;
    onNestedFieldsChange?: (checked: boolean) => void;
}

export default function CollectionOverviewStats({
    numDocuments,
    fieldsCount,
    createdAt,
    enableNestedFields,
    defaultSortingField,
    onNestedFieldsChange
}: CollectionOverviewStatsProps) {
    const daysOld = Math.ceil((Date.now() - createdAt * 1000) / (1000 * 60 * 60 * 24));

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border border-border/50">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Documents
                        </CardTitle>
                        <FileText className="h-5 w-5 text-blue-500" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold tracking-tight">
                        {numDocuments.toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                        Total indexed records
                    </p>
                </CardContent>
            </Card>

            <Card className="border border-border/50">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Schema Fields
                        </CardTitle>
                        <Hash className="h-5 w-5 text-purple-500" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold tracking-tight">
                        {fieldsCount}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                        Defined field types
                    </p>
                </CardContent>
            </Card>

            <Card className="border border-border/50">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Created
                        </CardTitle>
                        <Calendar className="h-5 w-5 text-amber-500" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold tracking-tight">
                        {daysOld}d
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                        {new Date(createdAt * 1000).toLocaleDateString()}
                    </p>
                </CardContent>
            </Card>

            <Card className="border border-border/50">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Configuration
                        </CardTitle>
                        <Settings className="h-5 w-5 text-emerald-500" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">Nested Fields</span>
                            <Switch
                                checked={enableNestedFields}
                                onCheckedChange={onNestedFieldsChange}
                            />
                        </div>
                        <div className="text-xs text-muted-foreground">
                            Sort: {defaultSortingField || 'None'}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}