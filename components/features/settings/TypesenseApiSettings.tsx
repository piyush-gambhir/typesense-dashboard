'use client';

import { Check, Copy, Eye, EyeOff, Key, Plus, Shield, Trash2, Users } from 'lucide-react';
import { useEffect, useState } from 'react';

import { createApiKey, deleteApiKey } from '@/lib/typesense/api-keys';
import { getCollections } from '@/lib/typesense/collections';
import { cn } from '@/lib/utils';

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
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';

interface ApiKey {
    id: string | number;
    description: string | undefined;
    actions: string[];
    collections: string[];
    value?: string;
}

const availableActions = [
    { value: 'documents:create', label: 'Create Documents', category: 'Documents' },
    { value: 'documents:delete', label: 'Delete Documents', category: 'Documents' },
    { value: 'documents:update', label: 'Update Documents', category: 'Documents' },
    { value: 'documents:*', label: 'All Document Actions', category: 'Documents' },
    { value: 'collections:create', label: 'Create Collections', category: 'Collections' },
    { value: 'collections:delete', label: 'Delete Collections', category: 'Collections' },
    { value: 'collections:update', label: 'Update Collections', category: 'Collections' },
    { value: 'collections:*', label: 'All Collection Actions', category: 'Collections' },
    { value: 'search', label: 'Search Documents', category: 'Search' },
    { value: 'keys:create', label: 'Create API Keys', category: 'Keys' },
    { value: 'keys:delete', label: 'Delete API Keys', category: 'Keys' },
    { value: 'keys:list', label: 'List API Keys', category: 'Keys' },
    { value: 'keys:*', label: 'All Key Actions', category: 'Keys' },
    { value: 'curations:upsert', label: 'Manage Curations', category: 'Advanced' },
    { value: 'curations:delete', label: 'Delete Curations', category: 'Advanced' },
    { value: 'curations:*', label: 'All Curation Actions', category: 'Advanced' },
    { value: 'synonyms:upsert', label: 'Manage Synonyms', category: 'Advanced' },
    { value: 'synonyms:delete', label: 'Delete Synonyms', category: 'Advanced' },
    { value: 'synonyms:*', label: 'All Synonym Actions', category: 'Advanced' },
    { value: 'aliases:upsert', label: 'Manage Aliases', category: 'Advanced' },
    { value: 'aliases:delete', label: 'Delete Aliases', category: 'Advanced' },
    { value: 'aliases:*', label: 'All Alias Actions', category: 'Advanced' },
    { value: 'debug', label: 'Debug Access', category: 'System' },
    { value: 'metrics', label: 'View Metrics', category: 'System' },
];

const actionCategories = ['Documents', 'Collections', 'Search', 'Keys', 'Advanced', 'System'];

function ApiKeyCard({ apiKey, onDelete }: { apiKey: ApiKey; onDelete: (id: string) => void }) {
    const [showValue, setShowValue] = useState(false);
    const [copied, setCopied] = useState(false);

    const copyToClipboard = async (text: string) => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast({
            title: 'Copied!',
            description: 'API key copied to clipboard',
        });
    };

    const getActionBadgeColor = (action: string) => {
        if (action.includes('*')) return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800/50';
        if (action.includes('delete')) return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800/50';
        if (action.includes('create')) return 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800/50';
        return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800/50';
    };

    return (
        <Card className="border border-border/50 bg-gradient-to-br from-card via-card to-card/95 shadow-sm backdrop-blur-sm transition-all hover:shadow-md">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="space-y-2">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <div className="p-1.5 bg-primary/10 rounded-lg ring-1 ring-primary/20">
                                <Key className="h-4 w-4 text-primary" />
                            </div>
                            {apiKey.description || 'Unnamed Key'}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">
                                ID: {apiKey.id}
                            </Badge>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(apiKey.id.toString())}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* API Key Value */}
                {apiKey.value && (
                    <div className="space-y-2">
                        <Label className="text-sm font-medium flex items-center gap-2">
                            <Shield className="h-3 w-3" />
                            API Key
                        </Label>
                        <div className="flex items-center gap-2">
                            <div className="flex-1 p-2 bg-muted/50 rounded border font-mono text-sm">
                                {showValue ? apiKey.value : '••••••••••••••••••••••••••••••••'}
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowValue(!showValue)}
                            >
                                {showValue ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(apiKey.value!)}
                                className={cn(copied && "text-emerald-600")}
                            >
                                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                            </Button>
                        </div>
                    </div>
                )}

                {/* Collections */}
                <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-2">
                        <Users className="h-3 w-3" />
                        Collections ({apiKey.collections.length})
                    </Label>
                    <div className="flex flex-wrap gap-1">
                        {apiKey.collections.map((collection) => (
                            <Badge
                                key={collection}
                                variant="outline"
                                className="text-xs bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800/50"
                            >
                                {collection}
                            </Badge>
                        ))}
                    </div>
                </div>

                {/* Actions */}
                <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-2">
                        <Shield className="h-3 w-3" />
                        Permissions ({apiKey.actions.length})
                    </Label>
                    <div className="flex flex-wrap gap-1">
                        {apiKey.actions.map((action) => (
                            <Badge
                                key={action}
                                variant="outline"
                                className={cn("text-xs border", getActionBadgeColor(action))}
                            >
                                {action}
                            </Badge>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function CreateKeyDialog({ 
    isOpen, 
    onOpenChange, 
    onCreate 
}: { 
    isOpen: boolean; 
    onOpenChange: (open: boolean) => void; 
    onCreate: (description: string, actions: string[], collections: string[]) => void; 
}) {
    const [description, setDescription] = useState('');
    const [selectedActions, setSelectedActions] = useState<string[]>([]);
    const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
    const [availableCollections, setAvailableCollections] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchCollections = async () => {
            const collections = await getCollections();
            if (collections && collections.success && collections.data) {
                setAvailableCollections(collections.data.map((c) => c.name));
            }
        };
        fetchCollections();
    }, []);

    const handleCreate = async () => {
        if (!description || selectedCollections.length === 0) {
            toast({
                title: 'Validation Error',
                description: 'Description and at least one collection are required',
                variant: 'destructive',
            });
            return;
        }

        setIsLoading(true);
        try {
            await onCreate(description, selectedActions, selectedCollections);
            setDescription('');
            setSelectedActions([]);
            setSelectedCollections([]);
            onOpenChange(false);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleAction = (action: string) => {
        setSelectedActions(prev => 
            prev.includes(action) 
                ? prev.filter(a => a !== action)
                : [...prev, action]
        );
    };

    const toggleCollection = (collection: string) => {
        setSelectedCollections(prev => 
            prev.includes(collection) 
                ? prev.filter(c => c !== collection)
                : [...prev, collection]
        );
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <div className="p-1.5 bg-primary/10 rounded-lg ring-1 ring-primary/20">
                            <Plus className="h-4 w-4 text-primary" />
                        </div>
                        Create New API Key
                    </DialogTitle>
                    <DialogDescription>
                        Create a new API key with specific permissions and collection access.
                    </DialogDescription>
                </DialogHeader>
                
                <ScrollArea className="flex-1 pr-4">
                    <div className="space-y-6 py-4">
                        {/* Description */}
                        <div className="space-y-2">
                            <Label htmlFor="description">Description *</Label>
                            <Input
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="e.g., Frontend Search Key"
                                className="w-full"
                            />
                        </div>

                        {/* Collections */}
                        <div className="space-y-3">
                            <Label>Collections * (Select at least one)</Label>
                            <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto p-3 border rounded-lg bg-muted/20">
                                {availableCollections.map((collection) => (
                                    <div key={collection} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`collection-${collection}`}
                                            checked={selectedCollections.includes(collection)}
                                            onCheckedChange={() => toggleCollection(collection)}
                                        />
                                        <Label
                                            htmlFor={`collection-${collection}`}
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                        >
                                            {collection}
                                        </Label>
                                    </div>
                                ))}
                                {availableCollections.length === 0 && (
                                    <p className="text-sm text-muted-foreground text-center py-2">
                                        No collections available
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="space-y-3">
                            <Label>Permissions (Optional - defaults to search only)</Label>
                            <div className="space-y-4">
                                {actionCategories.map((category) => {
                                    const categoryActions = availableActions.filter(a => a.category === category);
                                    return (
                                        <div key={category} className="space-y-2">
                                            <h4 className="text-sm font-medium text-muted-foreground">{category}</h4>
                                            <div className="grid grid-cols-1 gap-2 pl-4">
                                                {categoryActions.map((action) => (
                                                    <div key={action.value} className="flex items-center space-x-2">
                                                        <Checkbox
                                                            id={`action-${action.value}`}
                                                            checked={selectedActions.includes(action.value)}
                                                            onCheckedChange={() => toggleAction(action.value)}
                                                        />
                                                        <Label
                                                            htmlFor={`action-${action.value}`}
                                                            className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                                        >
                                                            {action.label}
                                                        </Label>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </ScrollArea>

                <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleCreate} 
                        disabled={isLoading || !description || selectedCollections.length === 0}
                        className="gap-2"
                    >
                        {isLoading ? (
                            <>Creating...</>
                        ) : (
                            <>
                                <Plus className="h-4 w-4" />
                                Create Key
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function EmptyState({ onCreateClick }: { onCreateClick: () => void }) {
    return (
        <Card className="border border-border/50">
            <CardContent>
                <div className="flex flex-col items-center justify-center py-16 space-y-6">
                    <div className="relative">
                        <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center ring-1 ring-primary/20 shadow-lg">
                            <Key className="h-10 w-10 text-primary" />
                        </div>
                        <div className="absolute -top-1 -right-1">
                            <div className="w-6 h-6 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center ring-2 ring-background shadow-lg">
                                <Plus className="h-3 w-3 text-white" />
                            </div>
                        </div>
                    </div>
                    <div className="text-center space-y-3">
                        <h3 className="text-2xl font-semibold tracking-tight">
                            No API Keys Found
                        </h3>
                        <p className="text-muted-foreground leading-relaxed max-w-md">
                            Get started by creating your first API key to access your Typesense collections.
                            You can configure specific permissions and collection access.
                        </p>
                    </div>
                    <Button onClick={onCreateClick} className="gap-2">
                        <Plus className="h-4 w-4" />
                        Create First API Key
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

function ApiKeysSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="border border-border/50">
                    <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                            <div className="space-y-2">
                                <Skeleton className="h-6 w-40" />
                                <Skeleton className="h-4 w-20" />
                            </div>
                            <Skeleton className="h-8 w-8" />
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-16" />
                            <Skeleton className="h-8 w-full" />
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-24" />
                            <div className="flex gap-1">
                                <Skeleton className="h-6 w-16" />
                                <Skeleton className="h-6 w-20" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-20" />
                            <div className="flex gap-1 flex-wrap">
                                <Skeleton className="h-6 w-12" />
                                <Skeleton className="h-6 w-16" />
                                <Skeleton className="h-6 w-14" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

export default function TypesenseApiSettings({
    initialApiKeys,
}: Readonly<{
    initialApiKeys: ApiKey[];
}>) {
    const [apiKeys, setApiKeys] = useState<ApiKey[]>(
        Array.isArray(initialApiKeys) ? initialApiKeys : [],
    );
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleCreateKey = async (description: string, actions: string[], collections: string[]) => {
        const newKey = await createApiKey(description, actions, collections);

        if (newKey) {
            setApiKeys([
                ...apiKeys,
                {
                    id: newKey.id.toString(),
                    description: newKey.description,
                    actions: newKey.actions,
                    collections: newKey.collections,
                    value: newKey.value,
                },
            ]);
            toast({
                title: 'Success',
                description: `New API key created successfully`,
            });
        } else {
            toast({
                title: 'Error',
                description: 'Failed to create new API key',
                variant: 'destructive',
            });
        }
    };

    const handleDeleteKey = async (keyId: string) => {
        const result = await deleteApiKey(Number(keyId));
        if (result) {
            setApiKeys(apiKeys.filter((key) => key.id !== keyId));
            toast({
                title: 'Success',
                description: 'API key deleted successfully',
            });
        } else {
            toast({
                title: 'Error',
                description: 'Failed to delete API key',
                variant: 'destructive',
            });
        }
    };

    if (isLoading) {
        return <ApiKeysSkeleton />;
    }

    return (
        <div className="space-y-8">
            {/* Overview Stats */}
            <Card className="border border-border/50">
                <CardHeader>
                    <CardTitle className="text-xl font-semibold flex items-center gap-2">
                        <div className="p-2 bg-primary/10 rounded-lg ring-1 ring-primary/20">
                            <Shield className="h-5 w-5 text-primary" />
                        </div>
                        API Key Management
                    </CardTitle>
                    <CardDescription>
                        Secure access control for your Typesense collections and operations
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Badge variant="secondary" className="gap-1">
                                <Key className="h-3 w-3" />
                                {apiKeys.length} {apiKeys.length === 1 ? 'Key' : 'Keys'}
                            </Badge>
                        </div>
                        <CreateKeyDialog
                            isOpen={isCreateDialogOpen}
                            onOpenChange={setIsCreateDialogOpen}
                            onCreate={handleCreateKey}
                        />
                        <Button 
                            onClick={() => setIsCreateDialogOpen(true)}
                            className="gap-2 bg-gradient-to-r from-primary to-primary/90 shadow-lg font-medium"
                        >
                            <Plus className="h-4 w-4" />
                            Create API Key
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* API Keys Grid */}
            {apiKeys.length === 0 ? (
                <EmptyState onCreateClick={() => setIsCreateDialogOpen(true)} />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {apiKeys.map((key) => (
                        <ApiKeyCard
                            key={key.id}
                            apiKey={key}
                            onDelete={handleDeleteKey}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}