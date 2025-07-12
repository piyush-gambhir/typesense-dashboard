'use client';

import { Bot, Edit, Plus, Trash2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';

import {
    type NLSearchModel,
    deleteNLSearchModel,
    listNLSearchModels,
} from '@/lib/typesense/nl-search-models';

import { useToast } from '@/hooks/useToast';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
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

    const fetchModels = async () => {
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
    };

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
        return (
            <div className="container mx-auto p-4 md:p-8 flex flex-col gap-y-4">
                <Card className="border-none shadow-none">
                    <CardContent className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 md:p-8 flex flex-col gap-y-4">
            <Card className="border-none shadow-none">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>
                                Natural Language Search Models
                            </CardTitle>
                            <CardDescription>
                                Manage AI models for natural language search
                                functionality
                            </CardDescription>
                        </div>
                        <Button onClick={() => setIsCreateDialogOpen(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Model
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
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
                                    <TableHead>Temperature</TableHead>
                                    <TableHead>Max Bytes</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {models.map((model) => {
                                    const provider = getProviderFromModelName(
                                        model.model_name,
                                    );
                                    return (
                                        <TableRow key={model.id}>
                                            <TableCell className="font-mono text-sm">
                                                {model.id}
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">
                                                        {model.model_name}
                                                    </div>
                                                    {model.system_prompt && (
                                                        <div className="text-xs text-muted-foreground truncate max-w-xs">
                                                            {
                                                                model.system_prompt
                                                            }
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">
                                                    {provider}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {model.temperature !== undefined
                                                    ? model.temperature
                                                    : 'N/A'}
                                            </TableCell>
                                            <TableCell>
                                                {model.max_bytes
                                                    ? `${model.max_bytes.toLocaleString()}`
                                                    : 'N/A'}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() =>
                                                            handleEdit(model)
                                                        }
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
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
                                    );
                                })}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

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
                            Are you sure you want to delete the model &quot;
                            {modelToDelete?.name}&quot;? This action cannot be
                            undone and will disable natural language search for
                            associated collections.
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
