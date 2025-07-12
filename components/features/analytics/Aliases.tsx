'use client';

import {
    Database,
    Edit,
    Link,
    Loader2,
    PlusCircle,
    Search,
    Trash2,
} from 'lucide-react';
import { useEffect, useState } from 'react';

import {
    createAlias,
    deleteAlias,
    listAliases,
    updateAlias,
} from '@/lib/typesense/aliases';
import { getCollections } from '@/lib/typesense/collections';

import { toast } from '@/hooks/useToast';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
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
    DialogTrigger,
} from '@/components/ui/dialog';
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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';

import LoadingSpinner from '@/components/common/LoadingSpinner';

interface Alias {
    name: string;
    collection_name: string;
}

export default function Aliases() {
    const [aliases, setAliases] = useState<Alias[]>([]);
    const [filteredAliases, setFilteredAliases] = useState<Alias[]>([]);
    const [collections, setCollections] = useState<string[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [newAliasName, setNewAliasName] = useState('');
    const [newAliasCollection, setNewAliasCollection] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [aliasToDelete, setAliasToDelete] = useState<string | null>(null);
    const [aliasToEdit, setAliasToEdit] = useState<Alias | null>(null);
    const [editAliasCollection, setEditAliasCollection] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const fetchAliases = async () => {
        try {
            const fetchedAliases = await listAliases();
            if (fetchedAliases) {
                setAliases(fetchedAliases);
                setFilteredAliases(fetchedAliases);
            }
        } catch {
            toast({
                title: 'Error',
                description: 'Failed to load aliases.',
                variant: 'destructive',
            });
        }
    };

    const fetchCollections = async () => {
        try {
            const fetchedCollections = await getCollections();
            if (
                fetchedCollections &&
                fetchedCollections.success &&
                fetchedCollections.data
            ) {
                setCollections(
                    fetchedCollections.data.map(
                        (col: { name: string }) => col.name,
                    ),
                );
            } else {
                toast({
                    title: 'Error',
                    description:
                        fetchedCollections?.error ||
                        'Failed to load collections.',
                    variant: 'destructive',
                });
            }
        } catch {
            toast({
                title: 'Error',
                description: 'Failed to load collections.',
                variant: 'destructive',
            });
        }
    };

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            await Promise.all([fetchAliases(), fetchCollections()]);
            setIsLoading(false);
        };
        loadData();
    }, []);

    // Filter aliases based on search term
    useEffect(() => {
        if (!searchTerm.trim()) {
            setFilteredAliases(aliases);
        } else {
            const filtered = aliases.filter(
                (alias) =>
                    alias.name
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                    alias.collection_name
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()),
            );
            setFilteredAliases(filtered);
        }
    }, [searchTerm, aliases]);

    const handleCreateAlias = async () => {
        if (!newAliasName?.trim() || !newAliasCollection) {
            toast({
                title: 'Validation Error',
                description: 'Please provide both alias name and collection.',
                variant: 'destructive',
            });
            return;
        }

        if (aliases.find((alias) => alias.name === newAliasName.trim())) {
            toast({
                title: 'Validation Error',
                description: 'An alias with this name already exists.',
                variant: 'destructive',
            });
            return;
        }

        setIsCreating(true);
        try {
            const created = await createAlias(newAliasName, newAliasCollection);
            if (created) {
                toast({
                    title: 'Alias Created',
                    description: `Alias '${newAliasName}' for collection '${newAliasCollection}' created successfully.`,
                });
                setNewAliasName('');
                setNewAliasCollection('');
                setIsCreateDialogOpen(false);
                fetchAliases();
            } else {
                toast({
                    title: 'Error',
                    description: 'Failed to create alias.',
                    variant: 'destructive',
                });
            }
        } catch (error: unknown) {
            toast({
                title: 'Error',
                description:
                    error instanceof Error
                        ? error.message
                        : 'Failed to create alias',
                variant: 'destructive',
            });
        } finally {
            setIsCreating(false);
        }
    };

    const handleUpdateAlias = async () => {
        if (!aliasToEdit || !editAliasCollection) {
            toast({
                title: 'Validation Error',
                description: 'Please select a collection.',
                variant: 'destructive',
            });
            return;
        }

        setIsUpdating(true);
        try {
            const updated = await updateAlias(
                aliasToEdit.name,
                editAliasCollection,
            );
            if (updated) {
                toast({
                    title: 'Alias Updated',
                    description: `Alias '${aliasToEdit.name}' now points to collection '${editAliasCollection}'.`,
                });
                fetchAliases();
            } else {
                toast({
                    title: 'Error',
                    description: 'Failed to update alias.',
                    variant: 'destructive',
                });
            }
        } catch (error: unknown) {
            toast({
                title: 'Error',
                description:
                    error instanceof Error
                        ? error.message
                        : 'Failed to update alias',
                variant: 'destructive',
            });
        } finally {
            setIsUpdating(false);
            setIsEditDialogOpen(false);
            setAliasToEdit(null);
            setEditAliasCollection('');
        }
    };

    const handleDeleteAlias = async () => {
        if (!aliasToDelete) return;

        try {
            const deleted = await deleteAlias(aliasToDelete);
            if (deleted) {
                toast({
                    title: 'Alias Deleted',
                    description: `Alias '${aliasToDelete}' deleted successfully.`,
                });
                fetchAliases();
            } else {
                toast({
                    title: 'Error',
                    description: 'Failed to delete alias.',
                    variant: 'destructive',
                });
            }
        } catch (error: unknown) {
            toast({
                title: 'Error',
                description:
                    error instanceof Error
                        ? error.message
                        : 'Failed to delete alias',
                variant: 'destructive',
            });
        } finally {
            setIsDeleteDialogOpen(false);
            setAliasToDelete(null);
        }
    };

    const openEditDialog = (alias: Alias) => {
        setAliasToEdit(alias);
        setEditAliasCollection(alias.collection_name);
        setIsEditDialogOpen(true);
    };

    const resetCreateForm = () => {
        setNewAliasName('');
        setNewAliasCollection('');
    };

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Information Alert */}
            <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/20">
                <Link className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <AlertDescription className="text-blue-800 dark:text-blue-200">
                    <strong>Collection Aliases</strong> allow you to reference
                    collections with different names. This is useful for:
                    <ul className="list-disc list-inside mt-3 space-y-1 text-sm">
                        <li>Creating friendly names for collections</li>
                        <li>Implementing zero-downtime schema changes</li>
                        <li>Switching between different collection versions</li>
                        <li>Maintaining backward compatibility</li>
                    </ul>
                </AlertDescription>
            </Alert>

            <Card className="shadow-sm border-0">
                <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                <Link className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <CardTitle className="text-xl font-semibold">
                                    Collection Aliases
                                </CardTitle>
                                <CardDescription className="text-sm text-muted-foreground">
                                    Manage your Typesense collection aliases
                                </CardDescription>
                            </div>
                        </div>
                        <Badge variant="secondary" className="text-sm">
                            {aliases.length}{' '}
                            {aliases.length === 1 ? 'alias' : 'aliases'}
                        </Badge>
                    </div>
                </CardHeader>

                <CardContent className="space-y-4">
                    {/* Search and Actions Bar */}
                    <div className="flex items-center justify-between gap-4">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                            <Input
                                placeholder="Search aliases or collections..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>

                        <Dialog
                            open={isCreateDialogOpen}
                            onOpenChange={setIsCreateDialogOpen}
                        >
                            <DialogTrigger asChild>
                                <Button onClick={resetCreateForm}>
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    Create Alias
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                                <DialogHeader>
                                    <DialogTitle className="flex items-center gap-2">
                                        <PlusCircle className="h-5 w-5" />
                                        Create New Alias
                                    </DialogTitle>
                                    <DialogDescription>
                                        Create a new alias to point to an
                                        existing collection. This allows you to
                                        reference the collection with a
                                        different name.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="alias-name">
                                            Alias Name
                                        </Label>
                                        <Input
                                            id="alias-name"
                                            value={newAliasName}
                                            onChange={(e) =>
                                                setNewAliasName(e.target.value)
                                            }
                                            placeholder="Enter alias name"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="collection-name">
                                            Collection
                                        </Label>
                                        <Select
                                            onValueChange={
                                                setNewAliasCollection
                                            }
                                            value={newAliasCollection}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a collection" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {collections.map((col) => (
                                                    <SelectItem
                                                        key={col}
                                                        value={col}
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <Database className="h-3 w-3" />
                                                            {col}
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button
                                        variant="outline"
                                        onClick={() =>
                                            setIsCreateDialogOpen(false)
                                        }
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handleCreateAlias}
                                        disabled={
                                            isCreating ||
                                            !newAliasName.trim() ||
                                            !newAliasCollection
                                        }
                                    >
                                        {isCreating ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Creating...
                                            </>
                                        ) : (
                                            'Create Alias'
                                        )}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <Separator />

                    {/* Aliases Table */}
                    {isLoading ? (
                        <div className="py-12">
                            <LoadingSpinner text="Loading aliases..." />
                        </div>
                    ) : (
                        <div className="rounded-lg border">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/50">
                                        <TableHead className="font-medium">
                                            Alias Name
                                        </TableHead>
                                        <TableHead className="font-medium">
                                            Points To Collection
                                        </TableHead>
                                        <TableHead className="text-right font-medium">
                                            Actions
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredAliases.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={3}
                                                className="text-center py-12"
                                            >
                                                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                                    <Link className="h-8 w-8" />
                                                    <p className="text-sm">
                                                        {searchTerm
                                                            ? 'No aliases found matching your search.'
                                                            : 'No aliases found.'}
                                                    </p>
                                                    {!searchTerm && (
                                                        <p className="text-xs">
                                                            Create your first
                                                            alias to get
                                                            started.
                                                        </p>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredAliases.map((alias) => (
                                            <TableRow
                                                key={alias.name}
                                                className="hover:bg-muted/30"
                                            >
                                                <TableCell>
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger>
                                                                <Badge
                                                                    variant="outline"
                                                                    className="font-medium"
                                                                >
                                                                    {alias.name}
                                                                </Badge>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <p>
                                                                    Alias:{' '}
                                                                    {alias.name}
                                                                </p>
                                                                <p>
                                                                    Points to:{' '}
                                                                    {
                                                                        alias.collection_name
                                                                    }
                                                                </p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                </TableCell>
                                                <TableCell>
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger>
                                                                <div className="flex items-center gap-2">
                                                                    <Database className="h-3 w-3 text-muted-foreground" />
                                                                    <span className="text-sm text-muted-foreground">
                                                                        {
                                                                            alias.collection_name
                                                                        }
                                                                    </span>
                                                                </div>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <p>
                                                                    Collection:{' '}
                                                                    {
                                                                        alias.collection_name
                                                                    }
                                                                </p>
                                                                <p>
                                                                    Referenced
                                                                    by alias:{' '}
                                                                    {alias.name}
                                                                </p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger
                                                                    asChild
                                                                >
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={() =>
                                                                            openEditDialog(
                                                                                alias,
                                                                            )
                                                                        }
                                                                    >
                                                                        <Edit className="w-4 h-4" />
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    <p>
                                                                        Edit
                                                                        alias
                                                                    </p>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger
                                                                    asChild
                                                                >
                                                                    <Button
                                                                        variant="destructive"
                                                                        size="sm"
                                                                        onClick={() => {
                                                                            setAliasToDelete(
                                                                                alias.name,
                                                                            );
                                                                            setIsDeleteDialogOpen(
                                                                                true,
                                                                            );
                                                                        }}
                                                                    >
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    <p>
                                                                        Delete
                                                                        alias
                                                                    </p>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Edit Alias Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Edit className="h-5 w-5" />
                            Edit Alias
                        </DialogTitle>
                        <DialogDescription>
                            Update which collection the alias '
                            {aliasToEdit?.name}' points to.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Alias Name</Label>
                            <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                                <Link className="h-4 w-4 text-muted-foreground" />
                                <Badge variant="outline">
                                    {aliasToEdit?.name}
                                </Badge>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-collection-name">
                                Collection
                            </Label>
                            <Select
                                onValueChange={setEditAliasCollection}
                                value={editAliasCollection}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a collection" />
                                </SelectTrigger>
                                <SelectContent>
                                    {collections.map((col) => (
                                        <SelectItem key={col} value={col}>
                                            <div className="flex items-center gap-2">
                                                <Database className="h-3 w-3" />
                                                {col}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsEditDialogOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleUpdateAlias}
                            disabled={isUpdating || !editAliasCollection}
                        >
                            {isUpdating ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                'Update Alias'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
            >
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-destructive">
                            <Trash2 className="h-5 w-5" />
                            Delete Alias
                        </DialogTitle>
                        <DialogDescription>
                            This action cannot be undone. This will permanently
                            delete the alias{' '}
                            <span className="font-bold">{aliasToDelete}</span>.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsDeleteDialogOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDeleteAlias}
                        >
                            Delete Alias
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
