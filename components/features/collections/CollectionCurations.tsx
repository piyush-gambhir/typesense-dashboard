'use client';

import {
    AlertCircle,
    ArrowDown,
    ArrowUp,
    Check,
    Edit,
    Filter,
    Info,
    PlusCircle,
    Search,
    Target,
    Trash2,
    X,
} from 'lucide-react';
import { useEffect, useState } from 'react';

import {
    type SearchOverride,
    createSearchOverride,
    deleteSearchOverride,
    listSearchOverrides,
    updateSearchOverride,
    validateOverrideData,
} from '@/lib/typesense/search-overrides';

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
import { Switch } from '@/components/ui/switch';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';

import LoadingSpinner from '@/components/common/LoadingSpinner';

interface CollectionCurationsProps {
    collectionName: string;
}

interface CurationOverride extends SearchOverride {
    collection_name: string;
}

export default function CollectionCurations({
    collectionName,
}: CollectionCurationsProps) {
    const [overrides, setOverrides] = useState<CurationOverride[]>([]);
    const [filteredOverrides, setFilteredOverrides] = useState<
        CurationOverride[]
    >([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    // Create/Edit form state
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingOverride, setEditingOverride] =
        useState<CurationOverride | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    // Form fields
    const [formData, setFormData] = useState({
        id: '',
        collection: collectionName,
        query: '',
        match: 'contains' as 'exact' | 'contains',
        appliesTo: 'always' as 'always' | 'on_match',
        forceInclude: [] as Array<{ id: string; position?: number }>,
        forceExclude: [] as Array<{ id: string }>,
        stopWords: [] as string[],
        filterBy: '',
        sortBy: '',
    });

    // Force include/exclude input states
    const [forceIncludeInput, setForceIncludeInput] = useState('');
    const [forceIncludePosition, setForceIncludePosition] = useState('');
    const [forceExcludeInput, setForceExcludeInput] = useState('');
    const [stopWordInput, setStopWordInput] = useState('');

    // Delete dialog
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [overrideToDelete, setOverrideToDelete] =
        useState<CurationOverride | null>(null);

    const fetchOverrides = async () => {
        try {
            const fetchedOverrides = await listSearchOverrides();
            if (fetchedOverrides) {
                // Filter overrides for this specific collection
                const collectionOverrides = fetchedOverrides.filter(
                    (override: any) =>
                        override.collection_name === collectionName,
                );
                setOverrides(collectionOverrides);
                setFilteredOverrides(collectionOverrides);
            }
        } catch {
            toast({
                title: 'Error',
                description: 'Failed to load search curations.',
                variant: 'destructive',
            });
        }
    };

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            await fetchOverrides();
            setIsLoading(false);
        };
        loadData();
    }, [collectionName]);

    // Filter overrides based on search term
    useEffect(() => {
        if (!searchTerm.trim()) {
            setFilteredOverrides(overrides);
        } else {
            const filtered = overrides.filter(
                (override) =>
                    override.id
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                    override.rule.query
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()),
            );
            setFilteredOverrides(filtered);
        }
    }, [searchTerm, overrides]);

    const resetForm = () => {
        setFormData({
            id: '',
            collection: collectionName,
            query: '',
            match: 'contains',
            appliesTo: 'always',
            forceInclude: [],
            forceExclude: [],
            stopWords: [],
            filterBy: '',
            sortBy: '',
        });
        setForceIncludeInput('');
        setForceIncludePosition('');
        setForceExcludeInput('');
        setStopWordInput('');
    };

    const openCreateDialog = () => {
        resetForm();
        setIsCreateDialogOpen(true);
    };

    const openEditDialog = (override: CurationOverride) => {
        setEditingOverride(override);
        setFormData({
            id: override.id,
            collection: override.collection_name,
            query: override.rule.query,
            match: override.rule.match || 'contains',
            appliesTo: override.applies_to,
            forceInclude: override.force_include || [],
            forceExclude: override.force_exclude || [],
            stopWords: override.stop_words || [],
            filterBy: override.filter_by || '',
            sortBy: override.sort_by || '',
        });
        setIsEditDialogOpen(true);
    };

    const addForceInclude = () => {
        if (forceIncludeInput.trim()) {
            const newInclude = {
                id: forceIncludeInput.trim(),
                ...(forceIncludePosition && {
                    position: parseInt(forceIncludePosition),
                }),
            };
            setFormData({
                ...formData,
                forceInclude: [...formData.forceInclude, newInclude],
            });
            setForceIncludeInput('');
            setForceIncludePosition('');
        }
    };

    const removeForceInclude = (index: number) => {
        setFormData({
            ...formData,
            forceInclude: formData.forceInclude.filter((_, i) => i !== index),
        });
    };

    const addForceExclude = () => {
        if (forceExcludeInput.trim()) {
            setFormData({
                ...formData,
                forceExclude: [
                    ...formData.forceExclude,
                    { id: forceExcludeInput.trim() },
                ],
            });
            setForceExcludeInput('');
        }
    };

    const removeForceExclude = (index: number) => {
        setFormData({
            ...formData,
            forceExclude: formData.forceExclude.filter((_, i) => i !== index),
        });
    };

    const addStopWord = () => {
        if (stopWordInput.trim()) {
            setFormData({
                ...formData,
                stopWords: [...formData.stopWords, stopWordInput.trim()],
            });
            setStopWordInput('');
        }
    };

    const removeStopWord = (index: number) => {
        setFormData({
            ...formData,
            stopWords: formData.stopWords.filter((_, i) => i !== index),
        });
    };

    const handleCreateOverride = async () => {
        if (!formData.id.trim() || !formData.query.trim()) {
            toast({
                title: 'Error',
                description: 'Please fill in all required fields.',
                variant: 'destructive',
            });
            return;
        }

        setIsCreating(true);
        try {
            const overrideData = {
                id: formData.id,
                rule: {
                    query: formData.query,
                    match: formData.match,
                    applies_to: formData.appliesTo,
                    ...(formData.forceInclude.length > 0 && {
                        include: formData.forceInclude,
                    }),
                    ...(formData.forceExclude.length > 0 && {
                        exclude: formData.forceExclude,
                    }),
                    ...(formData.stopWords.length > 0 && {
                        stop_words: formData.stopWords,
                    }),
                    ...(formData.filterBy && { filter_by: formData.filterBy }),
                    ...(formData.sortBy && { sort_by: formData.sortBy }),
                },
            };

            const validation = validateOverrideData(overrideData);
            if (!validation.valid) {
                toast({
                    title: 'Validation Error',
                    description: validation.errors.join(', '),
                    variant: 'destructive',
                });
                return;
            }

            const result = await createSearchOverride(
                collectionName,
                `override_${Date.now()}`,
                overrideData,
            );
            if (result) {
                toast({
                    title: 'Success',
                    description: 'Search curation created successfully.',
                });
                setIsCreateDialogOpen(false);
                resetForm();
                fetchOverrides();
            } else {
                throw new Error('Failed to create search curation');
            }
        } catch (error) {
            toast({
                title: 'Error',
                description:
                    error instanceof Error
                        ? error.message
                        : 'Failed to create search curation',
                variant: 'destructive',
            });
        } finally {
            setIsCreating(false);
        }
    };

    const handleUpdateOverride = async () => {
        if (!editingOverride) return;

        setIsUpdating(true);
        try {
            const overrideData = {
                id: formData.id,
                rule: {
                    query: formData.query,
                    match: formData.match,
                    applies_to: formData.appliesTo,
                    ...(formData.forceInclude.length > 0 && {
                        include: formData.forceInclude,
                    }),
                    ...(formData.forceExclude.length > 0 && {
                        exclude: formData.forceExclude,
                    }),
                    ...(formData.stopWords.length > 0 && {
                        stop_words: formData.stopWords,
                    }),
                    ...(formData.filterBy && { filter_by: formData.filterBy }),
                    ...(formData.sortBy && { sort_by: formData.sortBy }),
                },
            };

            const validation = validateOverrideData(overrideData);
            if (!validation.valid) {
                toast({
                    title: 'Validation Error',
                    description: validation.errors.join(', '),
                    variant: 'destructive',
                });
                return;
            }

            const result = await updateSearchOverride(
                collectionName,
                formData.id,
                overrideData,
            );
            if (result) {
                toast({
                    title: 'Success',
                    description: 'Search curation updated successfully.',
                });
                setIsEditDialogOpen(false);
                setEditingOverride(null);
                resetForm();
                fetchOverrides();
            } else {
                throw new Error('Failed to update search curation');
            }
        } catch (error) {
            toast({
                title: 'Error',
                description:
                    error instanceof Error
                        ? error.message
                        : 'Failed to update search curation',
                variant: 'destructive',
            });
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDeleteOverride = async () => {
        if (!overrideToDelete) return;

        try {
            const result = await deleteSearchOverride(
                collectionName,
                overrideToDelete.id,
            );
            if (result) {
                toast({
                    title: 'Success',
                    description: 'Search curation deleted successfully.',
                });
                setIsDeleteDialogOpen(false);
                setOverrideToDelete(null);
                fetchOverrides();
            } else {
                throw new Error('Failed to delete search curation');
            }
        } catch (error) {
            toast({
                title: 'Error',
                description:
                    error instanceof Error
                        ? error.message
                        : 'Failed to delete search curation',
                variant: 'destructive',
            });
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <LoadingSpinner text="Loading curations..." />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Search Curations</h1>
                    <p className="text-muted-foreground mt-2">
                        Manage search overrides for collection '{collectionName}
                        '
                    </p>
                </div>
                <Dialog
                    open={isCreateDialogOpen}
                    onOpenChange={setIsCreateDialogOpen}
                >
                    <DialogTrigger asChild>
                        <Button onClick={openCreateDialog}>
                            <PlusCircle className="h-4 w-4 mr-2" />
                            Create Curation
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Create Search Curation</DialogTitle>
                            <DialogDescription>
                                Create a new search override for collection '
                                {collectionName}'
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="curation-id">
                                        Curation ID
                                    </Label>
                                    <Input
                                        id="curation-id"
                                        value={formData.id}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                id: e.target.value,
                                            })
                                        }
                                        placeholder="Enter curation ID"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="query">Query</Label>
                                    <Input
                                        id="query"
                                        value={formData.query}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                query: e.target.value,
                                            })
                                        }
                                        placeholder="Enter search query"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Match Type</Label>
                                    <Select
                                        value={formData.match}
                                        onValueChange={(
                                            value: 'exact' | 'contains',
                                        ) =>
                                            setFormData({
                                                ...formData,
                                                match: value,
                                            })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="contains">
                                                Contains
                                            </SelectItem>
                                            <SelectItem value="exact">
                                                Exact
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Applies To</Label>
                                    <Select
                                        value={formData.appliesTo}
                                        onValueChange={(
                                            value: 'always' | 'on_match',
                                        ) =>
                                            setFormData({
                                                ...formData,
                                                appliesTo: value,
                                            })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="always">
                                                Always
                                            </SelectItem>
                                            <SelectItem value="on_match">
                                                On Match
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Filter By</Label>
                                    <Input
                                        value={formData.filterBy}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                filterBy: e.target.value,
                                            })
                                        }
                                        placeholder="Optional filter expression"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Sort By</Label>
                                    <Input
                                        value={formData.sortBy}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                sortBy: e.target.value,
                                            })
                                        }
                                        placeholder="Optional sort expression"
                                    />
                                </div>
                            </div>

                            <Separator />

                            {/* Force Include */}
                            <div className="space-y-2">
                                <Label>Force Include Documents</Label>
                                <div className="flex space-x-2">
                                    <Input
                                        value={forceIncludeInput}
                                        onChange={(e) =>
                                            setForceIncludeInput(e.target.value)
                                        }
                                        placeholder="Document ID"
                                    />
                                    <Input
                                        value={forceIncludePosition}
                                        onChange={(e) =>
                                            setForceIncludePosition(
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Position (optional)"
                                        type="number"
                                        className="w-24"
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={addForceInclude}
                                    >
                                        Add
                                    </Button>
                                </div>
                                {formData.forceInclude.length > 0 && (
                                    <div className="space-y-1">
                                        {formData.forceInclude.map(
                                            (item, index) => (
                                                <div
                                                    key={index}
                                                    className="flex items-center space-x-2"
                                                >
                                                    <Badge variant="secondary">
                                                        {item.id}
                                                        {item.position &&
                                                            ` (pos: ${item.position})`}
                                                    </Badge>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() =>
                                                            removeForceInclude(
                                                                index,
                                                            )
                                                        }
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            ),
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Force Exclude */}
                            <div className="space-y-2">
                                <Label>Force Exclude Documents</Label>
                                <div className="flex space-x-2">
                                    <Input
                                        value={forceExcludeInput}
                                        onChange={(e) =>
                                            setForceExcludeInput(e.target.value)
                                        }
                                        placeholder="Document ID"
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={addForceExclude}
                                    >
                                        Add
                                    </Button>
                                </div>
                                {formData.forceExclude.length > 0 && (
                                    <div className="space-y-1">
                                        {formData.forceExclude.map(
                                            (item, index) => (
                                                <div
                                                    key={index}
                                                    className="flex items-center space-x-2"
                                                >
                                                    <Badge variant="destructive">
                                                        {item.id}
                                                    </Badge>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() =>
                                                            removeForceExclude(
                                                                index,
                                                            )
                                                        }
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            ),
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Stop Words */}
                            <div className="space-y-2">
                                <Label>Stop Words</Label>
                                <div className="flex space-x-2">
                                    <Input
                                        value={stopWordInput}
                                        onChange={(e) =>
                                            setStopWordInput(e.target.value)
                                        }
                                        placeholder="Stop word"
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={addStopWord}
                                    >
                                        Add
                                    </Button>
                                </div>
                                {formData.stopWords.length > 0 && (
                                    <div className="space-y-1">
                                        {formData.stopWords.map(
                                            (word, index) => (
                                                <div
                                                    key={index}
                                                    className="flex items-center space-x-2"
                                                >
                                                    <Badge variant="outline">
                                                        {word}
                                                    </Badge>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() =>
                                                            removeStopWord(
                                                                index,
                                                            )
                                                        }
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            ),
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => setIsCreateDialogOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleCreateOverride}
                                disabled={isCreating}
                            >
                                {isCreating ? 'Creating...' : 'Create Curation'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Search and Filter */}
            <Card>
                <CardHeader>
                    <div className="flex items-center space-x-2">
                        <Search className="h-4 w-4" />
                        <Input
                            placeholder="Search curations..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="max-w-sm"
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <LoadingSpinner text="Loading curations..." />
                    ) : filteredOverrides.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            {searchTerm
                                ? 'No curations found matching your search.'
                                : 'No curations found.'}
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID</TableHead>
                                    <TableHead>Query</TableHead>
                                    <TableHead>Match</TableHead>
                                    <TableHead>Applies To</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredOverrides.map((override) => (
                                    <TableRow key={override.id}>
                                        <TableCell className="font-medium">
                                            {override.id}
                                        </TableCell>
                                        <TableCell>
                                            {override.rule.query}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">
                                                {override.rule.match}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">
                                                {override.applies_to}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center space-x-2">
                                                <Dialog
                                                    open={isEditDialogOpen}
                                                    onOpenChange={
                                                        setIsEditDialogOpen
                                                    }
                                                >
                                                    <DialogTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() =>
                                                                openEditDialog(
                                                                    override,
                                                                )
                                                            }
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                                                        <DialogHeader>
                                                            <DialogTitle>
                                                                Edit Search
                                                                Curation
                                                            </DialogTitle>
                                                            <DialogDescription>
                                                                Update the
                                                                search override
                                                                settings
                                                            </DialogDescription>
                                                        </DialogHeader>

                                                        {/* Same form content as create dialog */}
                                                        <div className="space-y-4">
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div className="space-y-2">
                                                                    <Label htmlFor="edit-curation-id">
                                                                        Curation
                                                                        ID
                                                                    </Label>
                                                                    <Input
                                                                        id="edit-curation-id"
                                                                        value={
                                                                            formData.id
                                                                        }
                                                                        onChange={(
                                                                            e,
                                                                        ) =>
                                                                            setFormData(
                                                                                {
                                                                                    ...formData,
                                                                                    id: e
                                                                                        .target
                                                                                        .value,
                                                                                },
                                                                            )
                                                                        }
                                                                        placeholder="Enter curation ID"
                                                                    />
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <Label htmlFor="edit-query">
                                                                        Query
                                                                    </Label>
                                                                    <Input
                                                                        id="edit-query"
                                                                        value={
                                                                            formData.query
                                                                        }
                                                                        onChange={(
                                                                            e,
                                                                        ) =>
                                                                            setFormData(
                                                                                {
                                                                                    ...formData,
                                                                                    query: e
                                                                                        .target
                                                                                        .value,
                                                                                },
                                                                            )
                                                                        }
                                                                        placeholder="Enter search query"
                                                                    />
                                                                </div>
                                                            </div>

                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div className="space-y-2">
                                                                    <Label>
                                                                        Match
                                                                        Type
                                                                    </Label>
                                                                    <Select
                                                                        value={
                                                                            formData.match
                                                                        }
                                                                        onValueChange={(
                                                                            value:
                                                                                | 'exact'
                                                                                | 'contains',
                                                                        ) =>
                                                                            setFormData(
                                                                                {
                                                                                    ...formData,
                                                                                    match: value,
                                                                                },
                                                                            )
                                                                        }
                                                                    >
                                                                        <SelectTrigger>
                                                                            <SelectValue />
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            <SelectItem value="contains">
                                                                                Contains
                                                                            </SelectItem>
                                                                            <SelectItem value="exact">
                                                                                Exact
                                                                            </SelectItem>
                                                                        </SelectContent>
                                                                    </Select>
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <Label>
                                                                        Applies
                                                                        To
                                                                    </Label>
                                                                    <Select
                                                                        value={
                                                                            formData.appliesTo
                                                                        }
                                                                        onValueChange={(
                                                                            value:
                                                                                | 'always'
                                                                                | 'on_match',
                                                                        ) =>
                                                                            setFormData(
                                                                                {
                                                                                    ...formData,
                                                                                    appliesTo:
                                                                                        value,
                                                                                },
                                                                            )
                                                                        }
                                                                    >
                                                                        <SelectTrigger>
                                                                            <SelectValue />
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            <SelectItem value="always">
                                                                                Always
                                                                            </SelectItem>
                                                                            <SelectItem value="on_match">
                                                                                On
                                                                                Match
                                                                            </SelectItem>
                                                                        </SelectContent>
                                                                    </Select>
                                                                </div>
                                                            </div>

                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div className="space-y-2">
                                                                    <Label>
                                                                        Filter
                                                                        By
                                                                    </Label>
                                                                    <Input
                                                                        value={
                                                                            formData.filterBy
                                                                        }
                                                                        onChange={(
                                                                            e,
                                                                        ) =>
                                                                            setFormData(
                                                                                {
                                                                                    ...formData,
                                                                                    filterBy:
                                                                                        e
                                                                                            .target
                                                                                            .value,
                                                                                },
                                                                            )
                                                                        }
                                                                        placeholder="Optional filter expression"
                                                                    />
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <Label>
                                                                        Sort By
                                                                    </Label>
                                                                    <Input
                                                                        value={
                                                                            formData.sortBy
                                                                        }
                                                                        onChange={(
                                                                            e,
                                                                        ) =>
                                                                            setFormData(
                                                                                {
                                                                                    ...formData,
                                                                                    sortBy: e
                                                                                        .target
                                                                                        .value,
                                                                                },
                                                                            )
                                                                        }
                                                                        placeholder="Optional sort expression"
                                                                    />
                                                                </div>
                                                            </div>

                                                            <Separator />

                                                            {/* Force Include */}
                                                            <div className="space-y-2">
                                                                <Label>
                                                                    Force
                                                                    Include
                                                                    Documents
                                                                </Label>
                                                                <div className="flex space-x-2">
                                                                    <Input
                                                                        value={
                                                                            forceIncludeInput
                                                                        }
                                                                        onChange={(
                                                                            e,
                                                                        ) =>
                                                                            setForceIncludeInput(
                                                                                e
                                                                                    .target
                                                                                    .value,
                                                                            )
                                                                        }
                                                                        placeholder="Document ID"
                                                                    />
                                                                    <Input
                                                                        value={
                                                                            forceIncludePosition
                                                                        }
                                                                        onChange={(
                                                                            e,
                                                                        ) =>
                                                                            setForceIncludePosition(
                                                                                e
                                                                                    .target
                                                                                    .value,
                                                                            )
                                                                        }
                                                                        placeholder="Position (optional)"
                                                                        type="number"
                                                                        className="w-24"
                                                                    />
                                                                    <Button
                                                                        type="button"
                                                                        variant="outline"
                                                                        onClick={
                                                                            addForceInclude
                                                                        }
                                                                    >
                                                                        Add
                                                                    </Button>
                                                                </div>
                                                                {formData
                                                                    .forceInclude
                                                                    .length >
                                                                    0 && (
                                                                    <div className="space-y-1">
                                                                        {formData.forceInclude.map(
                                                                            (
                                                                                item,
                                                                                index,
                                                                            ) => (
                                                                                <div
                                                                                    key={
                                                                                        index
                                                                                    }
                                                                                    className="flex items-center space-x-2"
                                                                                >
                                                                                    <Badge variant="secondary">
                                                                                        {
                                                                                            item.id
                                                                                        }
                                                                                        {item.position &&
                                                                                            ` (pos: ${item.position})`}
                                                                                    </Badge>
                                                                                    <Button
                                                                                        type="button"
                                                                                        variant="ghost"
                                                                                        size="sm"
                                                                                        onClick={() =>
                                                                                            removeForceInclude(
                                                                                                index,
                                                                                            )
                                                                                        }
                                                                                    >
                                                                                        <X className="h-3 w-3" />
                                                                                    </Button>
                                                                                </div>
                                                                            ),
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {/* Force Exclude */}
                                                            <div className="space-y-2">
                                                                <Label>
                                                                    Force
                                                                    Exclude
                                                                    Documents
                                                                </Label>
                                                                <div className="flex space-x-2">
                                                                    <Input
                                                                        value={
                                                                            forceExcludeInput
                                                                        }
                                                                        onChange={(
                                                                            e,
                                                                        ) =>
                                                                            setForceExcludeInput(
                                                                                e
                                                                                    .target
                                                                                    .value,
                                                                            )
                                                                        }
                                                                        placeholder="Document ID"
                                                                    />
                                                                    <Button
                                                                        type="button"
                                                                        variant="outline"
                                                                        onClick={
                                                                            addForceExclude
                                                                        }
                                                                    >
                                                                        Add
                                                                    </Button>
                                                                </div>
                                                                {formData
                                                                    .forceExclude
                                                                    .length >
                                                                    0 && (
                                                                    <div className="space-y-1">
                                                                        {formData.forceExclude.map(
                                                                            (
                                                                                item,
                                                                                index,
                                                                            ) => (
                                                                                <div
                                                                                    key={
                                                                                        index
                                                                                    }
                                                                                    className="flex items-center space-x-2"
                                                                                >
                                                                                    <Badge variant="destructive">
                                                                                        {
                                                                                            item.id
                                                                                        }
                                                                                    </Badge>
                                                                                    <Button
                                                                                        type="button"
                                                                                        variant="ghost"
                                                                                        size="sm"
                                                                                        onClick={() =>
                                                                                            removeForceExclude(
                                                                                                index,
                                                                                            )
                                                                                        }
                                                                                    >
                                                                                        <X className="h-3 w-3" />
                                                                                    </Button>
                                                                                </div>
                                                                            ),
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {/* Stop Words */}
                                                            <div className="space-y-2">
                                                                <Label>
                                                                    Stop Words
                                                                </Label>
                                                                <div className="flex space-x-2">
                                                                    <Input
                                                                        value={
                                                                            stopWordInput
                                                                        }
                                                                        onChange={(
                                                                            e,
                                                                        ) =>
                                                                            setStopWordInput(
                                                                                e
                                                                                    .target
                                                                                    .value,
                                                                            )
                                                                        }
                                                                        placeholder="Stop word"
                                                                    />
                                                                    <Button
                                                                        type="button"
                                                                        variant="outline"
                                                                        onClick={
                                                                            addStopWord
                                                                        }
                                                                    >
                                                                        Add
                                                                    </Button>
                                                                </div>
                                                                {formData
                                                                    .stopWords
                                                                    .length >
                                                                    0 && (
                                                                    <div className="space-y-1">
                                                                        {formData.stopWords.map(
                                                                            (
                                                                                word,
                                                                                index,
                                                                            ) => (
                                                                                <div
                                                                                    key={
                                                                                        index
                                                                                    }
                                                                                    className="flex items-center space-x-2"
                                                                                >
                                                                                    <Badge variant="outline">
                                                                                        {
                                                                                            word
                                                                                        }
                                                                                    </Badge>
                                                                                    <Button
                                                                                        type="button"
                                                                                        variant="ghost"
                                                                                        size="sm"
                                                                                        onClick={() =>
                                                                                            removeStopWord(
                                                                                                index,
                                                                                            )
                                                                                        }
                                                                                    >
                                                                                        <X className="h-3 w-3" />
                                                                                    </Button>
                                                                                </div>
                                                                            ),
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <DialogFooter>
                                                            <Button
                                                                variant="outline"
                                                                onClick={() =>
                                                                    setIsEditDialogOpen(
                                                                        false,
                                                                    )
                                                                }
                                                            >
                                                                Cancel
                                                            </Button>
                                                            <Button
                                                                onClick={
                                                                    handleUpdateOverride
                                                                }
                                                                disabled={
                                                                    isUpdating
                                                                }
                                                            >
                                                                {isUpdating
                                                                    ? 'Updating...'
                                                                    : 'Update Curation'}
                                                            </Button>
                                                        </DialogFooter>
                                                    </DialogContent>
                                                </Dialog>

                                                <Dialog
                                                    open={isDeleteDialogOpen}
                                                    onOpenChange={
                                                        setIsDeleteDialogOpen
                                                    }
                                                >
                                                    <DialogTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => {
                                                                setOverrideToDelete(
                                                                    override,
                                                                );
                                                                setIsDeleteDialogOpen(
                                                                    true,
                                                                );
                                                            }}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent>
                                                        <DialogHeader>
                                                            <DialogTitle>
                                                                Delete Curation
                                                            </DialogTitle>
                                                            <DialogDescription>
                                                                Are you sure you
                                                                want to delete
                                                                the curation "
                                                                {override.id}"?
                                                                This action
                                                                cannot be
                                                                undone.
                                                            </DialogDescription>
                                                        </DialogHeader>
                                                        <DialogFooter>
                                                            <Button
                                                                variant="outline"
                                                                onClick={() =>
                                                                    setIsDeleteDialogOpen(
                                                                        false,
                                                                    )
                                                                }
                                                            >
                                                                Cancel
                                                            </Button>
                                                            <Button
                                                                variant="destructive"
                                                                onClick={
                                                                    handleDeleteOverride
                                                                }
                                                            >
                                                                Delete
                                                            </Button>
                                                        </DialogFooter>
                                                    </DialogContent>
                                                </Dialog>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
