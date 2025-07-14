'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Save, X, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

import {
    listSynonyms,
    createSynonym,
    updateSynonym,
    deleteSynonym,
    validateSynonymData,
    type SynonymResponse,
    type CreateSynonymRequest,
} from '@/lib/typesense';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface CollectionSynonymsProps {
    collectionName: string;
}

export default function CollectionSynonyms({ collectionName }: CollectionSynonymsProps) {
    const [synonyms, setSynonyms] = useState<SynonymResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [editingSynonym, setEditingSynonym] = useState<SynonymResponse | null>(null);

    const [formData, setFormData] = useState<CreateSynonymRequest & { id?: string }>({
        synonyms: [],
        root: '',
        locale: '',
        symbols_to_index: [],
    });

    useEffect(() => {
        loadSynonyms();
    }, [collectionName]);

    const loadSynonyms = async () => {
        try {
            setLoading(true);
            setError(null);
            const result = await listSynonyms(collectionName);
            
            if (result.success && result.data) {
                setSynonyms(result.data);
            } else {
                setError(result.error || 'Failed to load synonyms');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load synonyms');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateSynonym = async () => {
        const validation = validateSynonymData(formData);
        if (!validation.valid) {
            toast.error(`Validation failed: ${validation.errors.join(', ')}`);
            return;
        }

        if (!formData.id?.trim()) {
            toast.error('Synonym ID is required');
            return;
        }

        try {
            const result = await createSynonym(collectionName, formData.id, {
                synonyms: formData.synonyms,
                root: formData.root || undefined,
                locale: formData.locale || undefined,
                symbols_to_index: formData.symbols_to_index?.length ? formData.symbols_to_index : undefined,
            });

            if (result.success) {
                toast.success('Synonym created successfully');
                setIsCreateDialogOpen(false);
                resetForm();
                loadSynonyms();
            } else {
                toast.error(result.error || 'Failed to create synonym');
            }
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to create synonym');
        }
    };

    const handleUpdateSynonym = async () => {
        if (!editingSynonym) return;

        const validation = validateSynonymData(formData);
        if (!validation.valid) {
            toast.error(`Validation failed: ${validation.errors.join(', ')}`);
            return;
        }

        try {
            const result = await updateSynonym(collectionName, editingSynonym.id, {
                synonyms: formData.synonyms,
                root: formData.root || undefined,
                locale: formData.locale || undefined,
                symbols_to_index: formData.symbols_to_index?.length ? formData.symbols_to_index : undefined,
            });

            if (result.success) {
                toast.success('Synonym updated successfully');
                setEditingSynonym(null);
                resetForm();
                loadSynonyms();
            } else {
                toast.error(result.error || 'Failed to update synonym');
            }
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to update synonym');
        }
    };

    const handleDeleteSynonym = async (synonymId: string) => {
        try {
            const result = await deleteSynonym(collectionName, synonymId);

            if (result.success) {
                toast.success('Synonym deleted successfully');
                loadSynonyms();
            } else {
                toast.error(result.error || 'Failed to delete synonym');
            }
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to delete synonym');
        }
    };

    const startEditing = (synonym: SynonymResponse) => {
        setEditingSynonym(synonym);
        setFormData({
            id: synonym.id,
            synonyms: synonym.synonyms,
            root: synonym.root || '',
            locale: synonym.locale || '',
            symbols_to_index: synonym.symbols_to_index || [],
        });
    };

    const resetForm = () => {
        setFormData({
            synonyms: [],
            root: '',
            locale: '',
            symbols_to_index: [],
        });
    };

    const handleSynonymsTextChange = (value: string) => {
        const synonymsArray = value.split(',').map(s => s.trim()).filter(s => s.length > 0);
        setFormData(prev => ({ ...prev, synonyms: synonymsArray }));
    };

    const handleSymbolsTextChange = (value: string) => {
        const symbolsArray = value.split(',').map(s => s.trim()).filter(s => s.length > 0);
        setFormData(prev => ({ ...prev, symbols_to_index: symbolsArray }));
    };

    if (loading) {
        return (
            <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                    <Card key={i}>
                        <CardContent className="p-6">
                            <div className="animate-pulse space-y-2">
                                <div className="h-4 bg-muted rounded w-1/4"></div>
                                <div className="h-3 bg-muted rounded w-3/4"></div>
                                <div className="h-3 bg-muted rounded w-1/2"></div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold">Synonyms Management</h3>
                    <p className="text-sm text-muted-foreground">
                        Manage search synonyms to improve search results
                    </p>
                </div>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={() => resetForm()}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Synonym
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Create New Synonym</DialogTitle>
                            <DialogDescription>
                                Define words that should be treated as equivalent during search
                            </DialogDescription>
                        </DialogHeader>
                        <SynonymForm
                            formData={formData}
                            setFormData={setFormData}
                            onSynonymsChange={handleSynonymsTextChange}
                            onSymbolsChange={handleSymbolsTextChange}
                        />
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setIsCreateDialogOpen(false);
                                    resetForm();
                                }}
                            >
                                Cancel
                            </Button>
                            <Button onClick={handleCreateSynonym}>Create Synonym</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {synonyms.length === 0 ? (
                <Card>
                    <CardContent className="p-8 text-center">
                        <div className="space-y-2">
                            <h4 className="text-lg font-medium">No synonyms found</h4>
                            <p className="text-muted-foreground">
                                Create your first synonym to improve search results
                            </p>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {synonyms.map((synonym) => (
                        <Card key={synonym.id}>
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-base">{synonym.id}</CardTitle>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => startEditing(synonym)}
                                        >
                                            <Edit2 className="h-4 w-4" />
                                        </Button>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="outline" size="sm">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Delete Synonym</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Are you sure you want to delete this synonym? This action cannot be undone.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={() => handleDeleteSynonym(synonym.id)}
                                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                    >
                                                        Delete
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <Label className="text-sm font-medium">Synonyms</Label>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {synonym.synonyms.map((word, index) => (
                                            <Badge key={index} variant="secondary">
                                                {word}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                                {synonym.root && (
                                    <div>
                                        <Label className="text-sm font-medium">Root Word</Label>
                                        <Badge variant="outline" className="mt-1">
                                            {synonym.root}
                                        </Badge>
                                    </div>
                                )}
                                {synonym.locale && (
                                    <div>
                                        <Label className="text-sm font-medium">Locale</Label>
                                        <Badge variant="outline" className="mt-1">
                                            {synonym.locale}
                                        </Badge>
                                    </div>
                                )}
                                {synonym.symbols_to_index && synonym.symbols_to_index.length > 0 && (
                                    <div>
                                        <Label className="text-sm font-medium">Symbols to Index</Label>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {synonym.symbols_to_index.map((symbol, index) => (
                                                <Badge key={index} variant="outline">
                                                    {symbol}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {editingSynonym && (
                <Dialog open={!!editingSynonym} onOpenChange={() => setEditingSynonym(null)}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Edit Synonym: {editingSynonym.id}</DialogTitle>
                            <DialogDescription>
                                Update the synonym definition
                            </DialogDescription>
                        </DialogHeader>
                        <SynonymForm
                            formData={formData}
                            setFormData={setFormData}
                            onSynonymsChange={handleSynonymsTextChange}
                            onSymbolsChange={handleSymbolsTextChange}
                            hideIdField
                        />
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setEditingSynonym(null);
                                    resetForm();
                                }}
                            >
                                <X className="h-4 w-4 mr-2" />
                                Cancel
                            </Button>
                            <Button onClick={handleUpdateSynonym}>
                                <Save className="h-4 w-4 mr-2" />
                                Update Synonym
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
}

interface SynonymFormProps {
    formData: CreateSynonymRequest & { id?: string };
    setFormData: React.Dispatch<React.SetStateAction<CreateSynonymRequest & { id?: string }>>;
    onSynonymsChange: (value: string) => void;
    onSymbolsChange: (value: string) => void;
    hideIdField?: boolean;
}

function SynonymForm({
    formData,
    setFormData,
    onSynonymsChange,
    onSymbolsChange,
    hideIdField = false,
}: SynonymFormProps) {
    return (
        <div className="space-y-4">
            {!hideIdField && (
                <div>
                    <Label htmlFor="synonymId">Synonym ID *</Label>
                    <Input
                        id="synonymId"
                        value={formData.id || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, id: e.target.value }))}
                        placeholder="e.g., shoe-synonyms"
                    />
                </div>
            )}
            
            <div>
                <Label htmlFor="synonyms">Synonyms * (comma-separated)</Label>
                <Textarea
                    id="synonyms"
                    value={formData.synonyms.join(', ')}
                    onChange={(e) => onSynonymsChange(e.target.value)}
                    placeholder="e.g., shoe, sneaker, footwear"
                    rows={3}
                />
                <p className="text-xs text-muted-foreground mt-1">
                    Enter words that should be treated as equivalent
                </p>
            </div>

            <div>
                <Label htmlFor="root">Root Word (optional)</Label>
                <Input
                    id="root"
                    value={formData.root || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, root: e.target.value }))}
                    placeholder="e.g., shoe"
                />
                <p className="text-xs text-muted-foreground mt-1">
                    For one-way synonyms: searching for synonyms will return documents with this root word
                </p>
            </div>

            <div>
                <Label htmlFor="locale">Locale (optional)</Label>
                <Input
                    id="locale"
                    value={formData.locale || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, locale: e.target.value }))}
                    placeholder="e.g., en"
                />
            </div>

            <div>
                <Label htmlFor="symbols">Symbols to Index (optional, comma-separated)</Label>
                <Input
                    id="symbols"
                    value={formData.symbols_to_index?.join(', ') || ''}
                    onChange={(e) => onSymbolsChange(e.target.value)}
                    placeholder="e.g., +, &, -"
                />
                <p className="text-xs text-muted-foreground mt-1">
                    Special characters to preserve during indexing
                </p>
            </div>
        </div>
    );
}