'use client';

import { RefreshCw, Save, Settings } from 'lucide-react';
import { useEffect, useState } from 'react';

import {
    getCollectionConfig,
    updateCollectionConfig,
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';

interface CollectionConfigManagerProps {
    collectionName: string;
}

interface CollectionConfig {
    name: string;
    num_documents: number;
    num_memory_shards: number;
    fields: any[];
    default_sorting_field?: string;
    enable_nested_fields?: boolean;
    created_at: number;
}

export default function CollectionConfigManager({
    collectionName,
}: CollectionConfigManagerProps) {
    const [config, setConfig] = useState<CollectionConfig | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const [localConfig, setLocalConfig] = useState<Partial<CollectionConfig>>(
        {},
    );

    useEffect(() => {
        fetchConfig();
    }, [collectionName]);

    const fetchConfig = async () => {
        try {
            const result = await getCollectionConfig(collectionName);
            if (result.success && result.data) {
                setConfig(result.data);
                setLocalConfig({
                    default_sorting_field: result.data.default_sorting_field,
                    enable_nested_fields: result.data.enable_nested_fields,
                });
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to fetch collection configuration',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleConfigChange = (key: string, value: any) => {
        const newLocalConfig = { ...localConfig, [key]: value };
        setLocalConfig(newLocalConfig);

        // Check if there are changes
        const hasChanges =
            config &&
            (newLocalConfig.default_sorting_field !==
                config.default_sorting_field ||
                newLocalConfig.enable_nested_fields !==
                    config.enable_nested_fields);
        setHasChanges(!!hasChanges);
    };

    const handleSave = async () => {
        if (!hasChanges) return;

        setSaving(true);
        try {
            const result = await updateCollectionConfig(
                collectionName,
                localConfig,
            );
            if (result.success) {
                toast({
                    title: 'Configuration Updated',
                    description:
                        'Collection configuration has been updated successfully',
                });
                setHasChanges(false);
                fetchConfig(); // Refresh the config
            } else {
                throw new Error(
                    result.error || 'Failed to update configuration',
                );
            }
        } catch (error) {
            toast({
                title: 'Error',
                description:
                    error instanceof Error
                        ? error.message
                        : 'Failed to update configuration',
                variant: 'destructive',
            });
        } finally {
            setSaving(false);
        }
    };

    const handleReset = () => {
        if (config) {
            setLocalConfig({
                default_sorting_field: config.default_sorting_field,
                enable_nested_fields: config.enable_nested_fields,
            });
            setHasChanges(false);
        }
    };

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Collection Configuration</CardTitle>
                    <CardDescription>Loading configuration...</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div
                                key={i}
                                className="h-8 bg-gray-100 rounded animate-pulse"
                            />
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!config) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Collection Configuration</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">
                        Failed to load configuration
                    </p>
                </CardContent>
            </Card>
        );
    }

    const sortableFields = config.fields
        .filter((field: any) =>
            ['int32', 'int64', 'float'].includes(field.type),
        )
        .map((field: any) => field.name);

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center space-x-2">
                                <Settings className="h-5 w-5" />
                                <span>Collection Configuration</span>
                            </CardTitle>
                            <CardDescription>
                                Manage collection settings and configuration
                                options
                            </CardDescription>
                        </div>
                        <div className="flex items-center space-x-2">
                            {hasChanges && (
                                <Badge
                                    variant="outline"
                                    className="text-orange-600"
                                >
                                    Unsaved Changes
                                </Badge>
                            )}
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleReset}
                                disabled={!hasChanges}
                            >
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Reset
                            </Button>
                            <Button
                                onClick={handleSave}
                                disabled={!hasChanges || saving}
                                size="sm"
                            >
                                <Save className="h-4 w-4 mr-2" />
                                {saving ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Collection Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-muted-foreground">
                                Collection Name
                            </Label>
                            <p className="text-sm font-medium">{config.name}</p>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-muted-foreground">
                                Documents
                            </Label>
                            <p className="text-sm font-medium">
                                {config.num_documents.toLocaleString()}
                            </p>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-muted-foreground">
                                Memory Shards
                            </Label>
                            <p className="text-sm font-medium">
                                {config.num_memory_shards}
                            </p>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-muted-foreground">
                                Created
                            </Label>
                            <p className="text-sm font-medium">
                                {new Date(
                                    config.created_at * 1000,
                                ).toLocaleDateString()}
                            </p>
                        </div>
                    </div>

                    <Separator />

                    {/* Configuration Options */}
                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold">
                            Configuration Options
                        </h3>

                        {/* Default Sorting Field */}
                        <div className="space-y-2">
                            <Label htmlFor="default-sorting">
                                Default Sorting Field
                            </Label>
                            <Select
                                value={
                                    localConfig.default_sorting_field || 'none'
                                }
                                onValueChange={(value) =>
                                    handleConfigChange(
                                        'default_sorting_field',
                                        value === 'none' ? undefined : value,
                                    )
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a field for default sorting" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">
                                        No default sorting
                                    </SelectItem>
                                    {sortableFields.map((fieldName) => (
                                        <SelectItem
                                            key={fieldName}
                                            value={fieldName}
                                        >
                                            {fieldName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-sm text-muted-foreground">
                                Choose a numeric field to use as the default
                                sorting field for search results
                            </p>
                        </div>

                        {/* Nested Fields */}
                        <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="nested-fields"
                                    checked={
                                        localConfig.enable_nested_fields ||
                                        false
                                    }
                                    onCheckedChange={(checked) =>
                                        handleConfigChange(
                                            'enable_nested_fields',
                                            checked,
                                        )
                                    }
                                />
                                <Label htmlFor="nested-fields">
                                    Enable Nested Fields
                                </Label>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Allow the collection to store and search nested
                                object fields
                            </p>
                        </div>
                    </div>

                    <Separator />

                    {/* Field Summary */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Field Summary</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-muted-foreground">
                                    Total Fields
                                </Label>
                                <p className="text-2xl font-bold">
                                    {config.fields.length}
                                </p>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-muted-foreground">
                                    Faceted Fields
                                </Label>
                                <p className="text-2xl font-bold">
                                    {
                                        config.fields.filter(
                                            (f: any) => f.facet,
                                        ).length
                                    }
                                </p>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-muted-foreground">
                                    Sortable Fields
                                </Label>
                                <p className="text-2xl font-bold">
                                    {sortableFields.length}
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
