'use client';

import { Bot, Edit, Plus, Trash2 } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';

import {
    type NLSearchModel,
    deleteNLSearchModel,
    listNLSearchModels,
} from '@/lib/typesense/nl-search-models';

import { useToast } from '@/hooks/useToast';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

import CreateNLSearchModelDialog from '@/components/features/search/CreateNLSearchModelDialog';
import EditNLSearchModelDialog from '@/components/features/search/EditNLSearchModelDialog';

function NLSearchModelsSkeleton() {
    return (
        <div className="space-y-6">
            {/* Header skeleton */}
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-80" />
                    <Skeleton className="h-4 w-96" />
                </div>
                <Skeleton className="h-10 w-32" />
            </div>

            {/* Table skeleton */}
            <Card className="relative overflow-hidden transition-all hover:shadow-md">
                <CardContent className="p-6">
                    <div className="space-y-4">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div
                                key={i}
                                className="flex items-center space-x-4"
                            >
                                <Skeleton className="h-4 w-20" />
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-4 w-20" />
                                <Skeleton className="h-8 w-16" />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default function NLSearchModels() {
    const { toast } = useToast();
    const [models, setModels] = useState<NLSearchModel[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedModel, setSelectedModel] = useState<NLSearchModel | null>(
        null,
    );
    const [modelToDelete, setModelToDelete] = useState<NLSearchModel | null>(
        null,
    );

    // const availableModelTypes = getAvailableModelTypes();

    const fetchModels = useCallback(async () => {
        setLoading(true);
        try {
            const result = await listNLSearchModels();
            if (result.success && result.data) {
                setModels(result.data);
            } else {
                toast({
                    title: 'Error',
                    description:
                        result.error || 'Failed to load NL search models.',
                    variant: 'destructive',
                });
            }
        } catch {
            toast({
                title: 'Error',
                description: 'Failed to load NL search models.',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchModels();
    }, [fetchModels]);

    const handleEdit = (model: NLSearchModel) => {
        setSelectedModel(model);
        setIsEditDialogOpen(true);
    };

    const handleDelete = (model: NLSearchModel) => {
        setModelToDelete(model);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!modelToDelete) return;

        try {
            const result = await deleteNLSearchModel(modelToDelete.id);
            if (result.success) {
                toast({
                    title: 'Success',
                    description: 'NL search model deleted successfully.',
                });
                fetchModels();
            } else {
                toast({
                    title: 'Error',
                    description:
                        result.error || 'Failed to delete NL search model.',
                    variant: 'destructive',
                });
            }
        } catch {
            toast({
                title: 'Error',
                description: 'Failed to delete NL search model.',
                variant: 'destructive',
            });
        } finally {
            setIsDeleteDialogOpen(false);
            setModelToDelete(null);
        }
    };

    const getProviderFromModelName = (modelName: string) => {
        if (modelName.startsWith('openai/')) return 'OpenAI';
        if (modelName.startsWith('anthropic/')) return 'Anthropic';
        if (modelName.startsWith('gcp/')) return 'Google Cloud';
        if (modelName.startsWith('cf/')) return 'Cloudflare Workers AI';
        if (modelName.startsWith('vllm/')) return 'vLLM (Self-hosted)';
        return 'Unknown';
    };

    if (loading) {
        return <NLSearchModelsSkeleton />;
    }

    return (
        <div className="space-y-6 container mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <h2 className="text-2xl font-semibold tracking-tight">
                        Natural Language Search Models
                    </h2>
                    <p className="text-muted-foreground">
                        Manage AI models for natural language search
                        functionality
                    </p>
                </div>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Model
                </Button>
            </div>

            {/* Content */}
            <Card className="relative overflow-hidden transition-all hover:shadow-md">
                <CardContent className="p-6">
                    {models.length === 0 ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="text-center space-y-6 max-w-md">
                                <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                                    <Bot className="h-8 w-8 text-muted-foreground" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-xl font-semibold">
                                        No NL Search Models
                                    </h3>
                                    <p className="text-muted-foreground">
                                        Create your first natural language
                                        search model to enable AI-powered search
                                        capabilities.
                                    </p>
                                </div>
                                <Button
                                    onClick={() => setIsCreateDialogOpen(true)}
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Create Model
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID</TableHead>
                                    <TableHead>Model Name</TableHead>
                                    <TableHead>Provider</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {models.map((model) => (
                                    <TableRow key={model.id}>
                                        <TableCell className="font-mono text-sm">
                                            {model.id}
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-1">
                                                <div className="font-medium">
                                                    {model.model_name}
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    {model.system_prompt
                                                        ? model.system_prompt.substring(
                                                              0,
                                                              50,
                                                          ) +
                                                          (model.system_prompt
                                                              .length > 50
                                                              ? '...'
                                                              : '')
                                                        : 'No system prompt'}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary">
                                                {getProviderFromModelName(
                                                    model.model_name,
                                                )}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">
                                                {model.api_key
                                                    ? 'Configured'
                                                    : 'Not configured'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() =>
                                                        handleEdit(model)
                                                    }
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() =>
                                                        handleDelete(model)
                                                    }
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Dialogs */}
            <CreateNLSearchModelDialog
                open={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
                onSuccess={fetchModels}
            />

            {selectedModel && (
                <EditNLSearchModelDialog
                    open={isEditDialogOpen}
                    onOpenChange={setIsEditDialogOpen}
                    model={selectedModel}
                    onSuccess={fetchModels}
                />
            )}

            <Dialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete NL Search Model</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete the NL search model{' '}
                            <strong>{modelToDelete?.model_name}</strong>? This
                            action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsDeleteDialogOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={confirmDelete}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
