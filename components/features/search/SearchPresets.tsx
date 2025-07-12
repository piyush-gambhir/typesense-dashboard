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

import { getCollections } from '@/lib/typesense/collections';
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

interface CurationOverride extends SearchOverride {
    collection_name: string;
}

export default function SearchPresets() {
    const [overrides, setOverrides] = useState<CurationOverride[]>([]);
    const [filteredOverrides, setFilteredOverrides] = useState<
        CurationOverride[]
    >([]);
    const [collections, setCollections] = useState<string[]>([]);
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
        collection: '',
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
                setOverrides(fetchedOverrides);
                setFilteredOverrides(fetchedOverrides);
            }
        } catch {
            toast({
                title: 'Error',
                description: 'Failed to load search curations.',
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
                    fetchedCollections.data.map((col: any) => col.name),
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
            await Promise.all([fetchOverrides(), fetchCollections()]);
            setIsLoading(false);
        };
        loadData();
    }, []);

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
                    override.collection_name
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
            collection: '',
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
            const position = forceIncludePosition
                ? parseInt(forceIncludePosition)
                : undefined;
            setFormData((prev) => ({
                ...prev,
                forceInclude: [
                    ...prev.forceInclude,
                    { id: forceIncludeInput.trim(), position },
                ],
            }));
            setForceIncludeInput('');
            setForceIncludePosition('');
        }
    };

    const removeForceInclude = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            forceInclude: prev.forceInclude.filter((_, i) => i !== index),
        }));
    };

    const addForceExclude = () => {
        if (forceExcludeInput.trim()) {
            setFormData((prev) => ({
                ...prev,
                forceExclude: [
                    ...prev.forceExclude,
                    { id: forceExcludeInput.trim() },
                ],
            }));
            setForceExcludeInput('');
        }
    };

    const removeForceExclude = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            forceExclude: prev.forceExclude.filter((_, i) => i !== index),
        }));
    };

    const addStopWord = () => {
        if (stopWordInput.trim()) {
            setFormData((prev) => ({
                ...prev,
                stopWords: [...prev.stopWords, stopWordInput.trim()],
            }));
            setStopWordInput('');
        }
    };

    const removeStopWord = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            stopWords: prev.stopWords.filter((_, i) => i !== index),
        }));
    };

    const handleCreateOverride = async () => {
        if (!formData.id || !formData.collection || !formData.query) {
            toast({
                title: 'Validation Error',
                description: 'Please fill in all required fields.',
                variant: 'destructive',
            });
            return;
        }

        const overrideData = {
            rule: {
                query: formData.query,
                match: formData.match,
            },
            applies_to: formData.appliesTo,
            ...(formData.forceInclude.length > 0 && {
                force_include: formData.forceInclude,
            }),
            ...(formData.forceExclude.length > 0 && {
                force_exclude: formData.forceExclude,
            }),
            ...(formData.stopWords.length > 0 && {
                stop_words: formData.stopWords,
            }),
            ...(formData.filterBy && { filter_by: formData.filterBy }),
            ...(formData.sortBy && { sort_by: formData.sortBy }),
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

        setIsCreating(true);
        try {
            const created = await createSearchOverride(
                formData.collection,
                formData.id,
                overrideData,
            );
            if (created) {
                toast({
                    title: 'Curation Created',
                    description: `Override '${formData.id}' created successfully.`,
                });
                setIsCreateDialogOpen(false);
                resetForm();
                fetchOverrides();
            } else {
                toast({
                    title: 'Error',
                    description: 'Failed to create search override.',
                    variant: 'destructive',
                });
            }
        } catch (error: any) {
            toast({
                title: 'Error',
                description:
                    error?.message || 'Failed to create search override',
                variant: 'destructive',
            });
        } finally {
            setIsCreating(false);
        }
    };

    const handleUpdateOverride = async () => {
        if (!editingOverride) return;

        const overrideData = {
            rule: {
                query: formData.query,
                match: formData.match,
            },
            applies_to: formData.appliesTo,
            ...(formData.forceInclude.length > 0 && {
                force_include: formData.forceInclude,
            }),
            ...(formData.forceExclude.length > 0 && {
                force_exclude: formData.forceExclude,
            }),
            ...(formData.stopWords.length > 0 && {
                stop_words: formData.stopWords,
            }),
            ...(formData.filterBy && { filter_by: formData.filterBy }),
            ...(formData.sortBy && { sort_by: formData.sortBy }),
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

        setIsUpdating(true);
        try {
            const updated = await updateSearchOverride(
                formData.collection,
                formData.id,
                overrideData,
            );
            if (updated) {
                toast({
                    title: 'Curation Updated',
                    description: `Override '${formData.id}' updated successfully.`,
                });
                setIsEditDialogOpen(false);
                setEditingOverride(null);
                resetForm();
                fetchOverrides();
            } else {
                toast({
                    title: 'Error',
                    description: 'Failed to update search override.',
                    variant: 'destructive',
                });
            }
        } catch (error: any) {
            toast({
                title: 'Error',
                description:
                    error?.message || 'Failed to update search override',
                variant: 'destructive',
            });
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDeleteOverride = async () => {
        if (!overrideToDelete) return;

        try {
            const deleted = await deleteSearchOverride(
                overrideToDelete.collection_name,
                overrideToDelete.id,
            );
            if (deleted) {
                toast({
                    title: 'Curation Deleted',
                    description: `Override '${overrideToDelete.id}' deleted successfully.`,
                });
                fetchOverrides();
            } else {
                toast({
                    title: 'Error',
                    description: 'Failed to delete search override.',
                    variant: 'destructive',
                });
            }
        } catch (error: any) {
            toast({
                title: 'Error',
                description:
                    error?.message || 'Failed to delete search override',
                variant: 'destructive',
            });
        } finally {
            setIsDeleteDialogOpen(false);
            setOverrideToDelete(null);
        }
    };

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Information Alert */}
            <Alert className="border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-950/20">
                <Target className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                <AlertDescription className="text-purple-800 dark:text-purple-200">
                    <strong>Search Curation</strong> allows you to control
                    search results by promoting or excluding specific documents
                    for given queries. This is useful for:
                    <ul className="list-disc list-inside mt-3 space-y-1 text-sm">
                        <li>
                            Promoting important documents for specific search
                            terms
                        </li>
                        <li>
                            Excluding irrelevant documents from search results
                        </li>
                        <li>Adding stop words to ignore in searches</li>
                        <li>
                            Customizing search behavior for better user
                            experience
                        </li>
                    </ul>
                </AlertDescription>
            </Alert>

            <Card className="shadow-sm border-0">
                <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                                <Target className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                                <CardTitle className="text-xl font-semibold">
                                    Search Curation
                                </CardTitle>
                                <CardDescription className="text-sm text-muted-foreground">
                                    Manage search overrides and result
                                    customization
                                </CardDescription>
                            </div>
                        </div>
                        <Badge variant="secondary" className="text-sm">
                            {overrides.length}{' '}
                            {overrides.length === 1 ? 'override' : 'overrides'}
                        </Badge>
                    </div>
                </CardHeader>

                <CardContent className="space-y-4">
                    {/* Search and Actions Bar */}
                    <div className="flex items-center justify-between gap-4">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                            <Input
                                placeholder="Search curations..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>

                        <Button onClick={openCreateDialog}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Create Curation
                        </Button>
                    </div>

                    <Separator />

                    {/* Curations Table */}
                    {isLoading ? (
                        <div className="py-12">
                            <LoadingSpinner text="Loading curations..." />
                        </div>
                    ) : (
                        <div className="rounded-lg border">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/50">
                                        <TableHead className="font-medium">
                                            ID
                                        </TableHead>
                                        <TableHead className="font-medium">
                                            Collection
                                        </TableHead>
                                        <TableHead className="font-medium">
                                            Query
                                        </TableHead>
                                        <TableHead className="font-medium">
                                            Type
                                        </TableHead>
                                        <TableHead className="font-medium">
                                            Actions
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredOverrides.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={5}
                                                className="text-center py-12"
                                            >
                                                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                                    <Target className="h-8 w-8" />
                                                    <p className="text-sm">
                                                        {searchTerm
                                                            ? 'No curations found matching your search.'
                                                            : 'No curations found.'}
                                                    </p>
                                                    {!searchTerm && (
                                                        <p className="text-xs">
                                                            Create your first
                                                            curation to get
                                                            started.
                                                        </p>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredOverrides.map((override) => (
                                            <TableRow
                                                key={`${override.collection_name}-${override.id}`}
                                                className="hover:bg-muted/30"
                                            >
                                                <TableCell>
                                                    <Badge
                                                        variant="outline"
                                                        className="font-medium"
                                                    >
                                                        {override.id}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="text-sm text-muted-foreground">
                                                        {
                                                            override.collection_name
                                                        }
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="max-w-xs">
                                                        <p className="text-sm font-medium truncate">
                                                            "
                                                            {
                                                                override.rule
                                                                    .query
                                                            }
                                                            "
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {override.rule
                                                                .match ||
                                                                'contains'}{' '}
                                                            match
                                                        </p>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-wrap gap-1">
                                                        {override.force_include &&
                                                            override
                                                                .force_include
                                                                .length > 0 && (
                                                                <Badge
                                                                    variant="default"
                                                                    className="text-xs"
                                                                >
                                                                    <ArrowUp className="w-3 h-3 mr-1" />
                                                                    {
                                                                        override
                                                                            .force_include
                                                                            .length
                                                                    }
                                                                </Badge>
                                                            )}
                                                        {override.force_exclude &&
                                                            override
                                                                .force_exclude
                                                                .length > 0 && (
                                                                <Badge
                                                                    variant="destructive"
                                                                    className="text-xs"
                                                                >
                                                                    <ArrowDown className="w-3 h-3 mr-1" />
                                                                    {
                                                                        override
                                                                            .force_exclude
                                                                            .length
                                                                    }
                                                                </Badge>
                                                            )}
                                                        {override.stop_words &&
                                                            override.stop_words
                                                                .length > 0 && (
                                                                <Badge
                                                                    variant="secondary"
                                                                    className="text-xs"
                                                                >
                                                                    <X className="w-3 h-3 mr-1" />
                                                                    {
                                                                        override
                                                                            .stop_words
                                                                            .length
                                                                    }
                                                                </Badge>
                                                            )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
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
                                                                                override,
                                                                            )
                                                                        }
                                                                    >
                                                                        <Edit className="w-4 h-4" />
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    <p>
                                                                        Edit
                                                                        curation
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
                                                                            setOverrideToDelete(
                                                                                override,
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
                                                                        curation
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

            {/* Create/Edit Dialog */}
            <Dialog
                open={isCreateDialogOpen || isEditDialogOpen}
                onOpenChange={(open) => {
                    if (!open) {
                        setIsCreateDialogOpen(false);
                        setIsEditDialogOpen(false);
                        setEditingOverride(null);
                        resetForm();
                    }
                }}
            >
                <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            {isEditDialogOpen ? (
                                <Edit className="h-5 w-5" />
                            ) : (
                                <PlusCircle className="h-5 w-5" />
                            )}
                            {isEditDialogOpen
                                ? 'Edit Curation'
                                : 'Create New Curation'}
                        </DialogTitle>
                        <DialogDescription>
                            {isEditDialogOpen
                                ? 'Update the search curation settings.'
                                : 'Create a new search curation to control search results for specific queries.'}
                        </DialogDescription>
                    </DialogHeader>

                    <Tabs defaultValue="basic" className="w-full">
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="basic">Basic</TabsTrigger>
                            <TabsTrigger value="promote">Promote</TabsTrigger>
                            <TabsTrigger value="exclude">Exclude</TabsTrigger>
                            <TabsTrigger value="advanced">Advanced</TabsTrigger>
                        </TabsList>

                        <TabsContent value="basic" className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="override-id">
                                        Override ID *
                                    </Label>
                                    <Input
                                        id="override-id"
                                        value={formData.id}
                                        onChange={(e) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                id: e.target.value,
                                            }))
                                        }
                                        placeholder="Enter unique override ID"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="collection">
                                        Collection *
                                    </Label>
                                    <Select
                                        value={formData.collection}
                                        onValueChange={(value) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                collection: value,
                                            }))
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select collection" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {collections.map((col) => (
                                                <SelectItem
                                                    key={col}
                                                    value={col}
                                                >
                                                    {col}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="query">Search Query *</Label>
                                <Input
                                    id="query"
                                    value={formData.query}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            query: e.target.value,
                                        }))
                                    }
                                    placeholder="Enter the search query to override"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="match">Match Type</Label>
                                    <Select
                                        value={formData.match}
                                        onValueChange={(
                                            value: 'exact' | 'contains',
                                        ) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                match: value,
                                            }))
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
                                    <Label htmlFor="applies-to">
                                        Applies To
                                    </Label>
                                    <Select
                                        value={formData.appliesTo}
                                        onValueChange={(
                                            value: 'always' | 'on_match',
                                        ) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                appliesTo: value,
                                            }))
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
                        </TabsContent>

                        <TabsContent value="promote" className="space-y-4">
                            <div className="space-y-2">
                                <Label>Force Include Documents</Label>
                                <p className="text-sm text-muted-foreground">
                                    Documents that should always appear in
                                    search results for this query
                                </p>
                            </div>

                            <div className="flex gap-2">
                                <Input
                                    placeholder="Document ID"
                                    value={forceIncludeInput}
                                    onChange={(e) =>
                                        setForceIncludeInput(e.target.value)
                                    }
                                    onKeyPress={(e) =>
                                        e.key === 'Enter' && addForceInclude()
                                    }
                                />
                                <Input
                                    placeholder="Position (optional)"
                                    type="number"
                                    value={forceIncludePosition}
                                    onChange={(e) =>
                                        setForceIncludePosition(e.target.value)
                                    }
                                    className="w-32"
                                />
                                <Button onClick={addForceInclude} size="sm">
                                    <ArrowUp className="w-4 h-4" />
                                </Button>
                            </div>

                            {formData.forceInclude.length > 0 && (
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">
                                        Promoted Documents:
                                    </Label>
                                    <div className="space-y-1">
                                        {formData.forceInclude.map(
                                            (item, index) => (
                                                <div
                                                    key={index}
                                                    className="flex items-center gap-2 p-2 bg-muted rounded"
                                                >
                                                    <ArrowUp className="w-4 h-4 text-green-600" />
                                                    <span className="text-sm">
                                                        {item.id}
                                                    </span>
                                                    {item.position && (
                                                        <Badge
                                                            variant="outline"
                                                            className="text-xs"
                                                        >
                                                            Position{' '}
                                                            {item.position}
                                                        </Badge>
                                                    )}
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() =>
                                                            removeForceInclude(
                                                                index,
                                                            )
                                                        }
                                                        className="ml-auto h-6 w-6 p-0"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </Button>
                                                </div>
                                            ),
                                        )}
                                    </div>
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="exclude" className="space-y-4">
                            <div className="space-y-2">
                                <Label>Force Exclude Documents</Label>
                                <p className="text-sm text-muted-foreground">
                                    Documents that should never appear in search
                                    results for this query
                                </p>
                            </div>

                            <div className="flex gap-2">
                                <Input
                                    placeholder="Document ID"
                                    value={forceExcludeInput}
                                    onChange={(e) =>
                                        setForceExcludeInput(e.target.value)
                                    }
                                    onKeyPress={(e) =>
                                        e.key === 'Enter' && addForceExclude()
                                    }
                                />
                                <Button onClick={addForceExclude} size="sm">
                                    <ArrowDown className="w-4 h-4" />
                                </Button>
                            </div>

                            {formData.forceExclude.length > 0 && (
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">
                                        Excluded Documents:
                                    </Label>
                                    <div className="space-y-1">
                                        {formData.forceExclude.map(
                                            (item, index) => (
                                                <div
                                                    key={index}
                                                    className="flex items-center gap-2 p-2 bg-muted rounded"
                                                >
                                                    <ArrowDown className="w-4 h-4 text-red-600" />
                                                    <span className="text-sm">
                                                        {item.id}
                                                    </span>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() =>
                                                            removeForceExclude(
                                                                index,
                                                            )
                                                        }
                                                        className="ml-auto h-6 w-6 p-0"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </Button>
                                                </div>
                                            ),
                                        )}
                                    </div>
                                </div>
                            )}

                            <Separator />

                            <div className="space-y-2">
                                <Label>Stop Words</Label>
                                <p className="text-sm text-muted-foreground">
                                    Words to ignore in search queries
                                </p>
                            </div>

                            <div className="flex gap-2">
                                <Input
                                    placeholder="Stop word"
                                    value={stopWordInput}
                                    onChange={(e) =>
                                        setStopWordInput(e.target.value)
                                    }
                                    onKeyPress={(e) =>
                                        e.key === 'Enter' && addStopWord()
                                    }
                                />
                                <Button onClick={addStopWord} size="sm">
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>

                            {formData.stopWords.length > 0 && (
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">
                                        Stop Words:
                                    </Label>
                                    <div className="flex flex-wrap gap-1">
                                        {formData.stopWords.map(
                                            (word, index) => (
                                                <Badge
                                                    key={index}
                                                    variant="secondary"
                                                    className="text-xs"
                                                >
                                                    {word}
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() =>
                                                            removeStopWord(
                                                                index,
                                                            )
                                                        }
                                                        className="ml-1 h-4 w-4 p-0 hover:bg-transparent"
                                                    >
                                                        <X className="w-2 h-2" />
                                                    </Button>
                                                </Badge>
                                            ),
                                        )}
                                    </div>
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="advanced" className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="filter-by">Filter By</Label>
                                <Input
                                    id="filter-by"
                                    value={formData.filterBy}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            filterBy: e.target.value,
                                        }))
                                    }
                                    placeholder="e.g., category:=electronics && price:>100"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Optional filter to apply to search results
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="sort-by">Sort By</Label>
                                <Input
                                    id="sort-by"
                                    value={formData.sortBy}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            sortBy: e.target.value,
                                        }))
                                    }
                                    placeholder="e.g., price:desc, relevance:desc"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Optional sorting to apply to search results
                                </p>
                            </div>
                        </TabsContent>
                    </Tabs>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsCreateDialogOpen(false);
                                setIsEditDialogOpen(false);
                                setEditingOverride(null);
                                resetForm();
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={
                                isEditDialogOpen
                                    ? handleUpdateOverride
                                    : handleCreateOverride
                            }
                            disabled={
                                isCreating ||
                                isUpdating ||
                                !formData.id ||
                                !formData.collection ||
                                !formData.query
                            }
                        >
                            {isCreating || isUpdating ? (
                                <>
                                    <LoadingSpinner className="mr-2 h-4 w-4" />
                                    {isCreating ? 'Creating...' : 'Updating...'}
                                </>
                            ) : (
                                <>
                                    {isEditDialogOpen ? (
                                        <Check className="mr-2 h-4 w-4" />
                                    ) : (
                                        <PlusCircle className="mr-2 h-4 w-4" />
                                    )}
                                    {isEditDialogOpen
                                        ? 'Update Curation'
                                        : 'Create Curation'}
                                </>
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
                            Delete Curation
                        </DialogTitle>
                        <DialogDescription>
                            This action cannot be undone. This will permanently
                            delete the curation{' '}
                            <span className="font-bold">
                                {overrideToDelete?.id}
                            </span>{' '}
                            from collection{' '}
                            <span className="font-bold">
                                {overrideToDelete?.collection_name}
                            </span>
                            .
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
                            onClick={handleDeleteOverride}
                        >
                            Delete Curation
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
