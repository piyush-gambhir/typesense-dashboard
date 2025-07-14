'use client';

import { Edit, Eye, Plus, Save, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';

import {
    addCollectionFields,
    getCollectionFields,
} from '@/lib/typesense/collections';

import { toast } from '@/hooks/use-toast';

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
import { Switch } from '@/components/ui/switch';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

interface CollectionFieldManagerProps {
    collectionName: string;
}

interface Field {
    name: string;
    type: string;
    facet: boolean;
    index: boolean;
    optional: boolean;
    sort: boolean;
    store: boolean;
}

const fieldTypes = [
    'string',
    'int32',
    'int64',
    'float',
    'bool',
    'string[]',
    'int32[]',
    'int64[]',
    'float[]',
    'bool[]',
    'object',
    'object[]',
    'auto',
];

export default function CollectionFieldManager({
    collectionName,
}: CollectionFieldManagerProps) {
    const [fields, setFields] = useState<Field[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [newFields, setNewFields] = useState<Field[]>([]);
    const [isAdding, setIsAdding] = useState(false);

    useEffect(() => {
        fetchFields();
    }, [collectionName]);

    const fetchFields = async () => {
        try {
            const result = await getCollectionFields(collectionName);
            if (result.success && result.data) {
                setFields(result.data);
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to fetch collection fields',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const addNewField = () => {
        setNewFields([
            ...newFields,
            {
                name: '',
                type: 'string',
                facet: false,
                index: true,
                optional: false,
                sort: false,
                store: true,
            },
        ]);
    };

    const removeNewField = (index: number) => {
        setNewFields(newFields.filter((_, i) => i !== index));
    };

    const updateNewField = (index: number, field: Partial<Field>) => {
        const updatedFields = [...newFields];
        updatedFields[index] = { ...updatedFields[index], ...field };
        setNewFields(updatedFields);
    };

    const handleAddFields = async () => {
        // Validate fields
        const validFields = newFields.filter(
            (field) => field.name.trim() !== '',
        );
        if (validFields.length === 0) {
            toast({
                title: 'Error',
                description: 'Please add at least one field with a name',
                variant: 'destructive',
            });
            return;
        }

        // Check for duplicate field names
        const fieldNames = validFields.map((f) => f.name);
        const existingFieldNames = fields.map((f) => f.name);
        const duplicates = fieldNames.filter((name) =>
            existingFieldNames.includes(name),
        );

        if (duplicates.length > 0) {
            toast({
                title: 'Error',
                description: `Field names already exist: ${duplicates.join(', ')}`,
                variant: 'destructive',
            });
            return;
        }

        setIsAdding(true);
        try {
            const result = await addCollectionFields(
                collectionName,
                validFields,
            );
            if (result.success) {
                toast({
                    title: 'Success',
                    description: `Added ${validFields.length} field(s) to collection`,
                });
                setIsAddDialogOpen(false);
                setNewFields([]);
                fetchFields(); // Refresh the fields list
            } else {
                throw new Error(result.error || 'Failed to add fields');
            }
        } catch (error) {
            toast({
                title: 'Error',
                description:
                    error instanceof Error
                        ? error.message
                        : 'Failed to add fields',
                variant: 'destructive',
            });
        } finally {
            setIsAdding(false);
        }
    };

    const getFieldTypeColor = (type: string) => {
        if (type.includes('[]')) return 'bg-blue-100 text-blue-800';
        if (type === 'auto') return 'bg-purple-100 text-purple-800';
        if (type === 'object') return 'bg-orange-100 text-orange-800';
        return 'bg-muted text-muted-foreground';
    };

    const getFieldPropertyIcon = (property: boolean) => {
        return property ? (
            <div className="w-2 h-2 bg-green-500 rounded-full" />
        ) : (
            <div className="w-2 h-2 bg-muted rounded-full" />
        );
    };

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Collection Fields</CardTitle>
                    <CardDescription>
                        Loading field information...
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div
                                key={i}
                                className="h-8 bg-muted rounded animate-pulse"
                            />
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Collection Fields</CardTitle>
                            <CardDescription>
                                Manage fields in collection '{collectionName}'
                            </CardDescription>
                        </div>
                        <Dialog
                            open={isAddDialogOpen}
                            onOpenChange={setIsAddDialogOpen}
                        >
                            <DialogTrigger asChild>
                                <Button>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Fields
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle>Add New Fields</DialogTitle>
                                    <DialogDescription>
                                        Add new fields to the collection. Note:
                                        You cannot modify existing fields.
                                    </DialogDescription>
                                </DialogHeader>

                                <div className="space-y-4">
                                    {newFields.map((field, index) => (
                                        <div
                                            key={index}
                                            className="border rounded-lg p-4 space-y-4"
                                        >
                                            <div className="flex items-center justify-between">
                                                <h4 className="font-medium">
                                                    Field {index + 1}
                                                </h4>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() =>
                                                        removeNewField(index)
                                                    }
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label>Field Name</Label>
                                                    <Input
                                                        value={field.name}
                                                        onChange={(e) =>
                                                            updateNewField(
                                                                index,
                                                                {
                                                                    name: e
                                                                        .target
                                                                        .value,
                                                                },
                                                            )
                                                        }
                                                        placeholder="Enter field name"
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label>Field Type</Label>
                                                    <Select
                                                        value={field.type}
                                                        onValueChange={(
                                                            value,
                                                        ) =>
                                                            updateNewField(
                                                                index,
                                                                { type: value },
                                                            )
                                                        }
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {fieldTypes.map(
                                                                (type) => (
                                                                    <SelectItem
                                                                        key={
                                                                            type
                                                                        }
                                                                        value={
                                                                            type
                                                                        }
                                                                    >
                                                                        {type}
                                                                    </SelectItem>
                                                                ),
                                                            )}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                <div className="flex items-center space-x-2">
                                                    <Switch
                                                        id={`facet-${index}`}
                                                        checked={field.facet}
                                                        onCheckedChange={(
                                                            checked,
                                                        ) =>
                                                            updateNewField(
                                                                index,
                                                                {
                                                                    facet: checked,
                                                                },
                                                            )
                                                        }
                                                    />
                                                    <Label
                                                        htmlFor={`facet-${index}`}
                                                    >
                                                        Facet
                                                    </Label>
                                                </div>

                                                <div className="flex items-center space-x-2">
                                                    <Switch
                                                        id={`index-${index}`}
                                                        checked={field.index}
                                                        onCheckedChange={(
                                                            checked,
                                                        ) =>
                                                            updateNewField(
                                                                index,
                                                                {
                                                                    index: checked,
                                                                },
                                                            )
                                                        }
                                                    />
                                                    <Label
                                                        htmlFor={`index-${index}`}
                                                    >
                                                        Index
                                                    </Label>
                                                </div>

                                                <div className="flex items-center space-x-2">
                                                    <Switch
                                                        id={`optional-${index}`}
                                                        checked={field.optional}
                                                        onCheckedChange={(
                                                            checked,
                                                        ) =>
                                                            updateNewField(
                                                                index,
                                                                {
                                                                    optional:
                                                                        checked,
                                                                },
                                                            )
                                                        }
                                                    />
                                                    <Label
                                                        htmlFor={`optional-${index}`}
                                                    >
                                                        Optional
                                                    </Label>
                                                </div>

                                                <div className="flex items-center space-x-2">
                                                    <Switch
                                                        id={`sort-${index}`}
                                                        checked={field.sort}
                                                        onCheckedChange={(
                                                            checked,
                                                        ) =>
                                                            updateNewField(
                                                                index,
                                                                {
                                                                    sort: checked,
                                                                },
                                                            )
                                                        }
                                                    />
                                                    <Label
                                                        htmlFor={`sort-${index}`}
                                                    >
                                                        Sort
                                                    </Label>
                                                </div>
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <Switch
                                                    id={`store-${index}`}
                                                    checked={field.store}
                                                    onCheckedChange={(
                                                        checked,
                                                    ) =>
                                                        updateNewField(index, {
                                                            store: checked,
                                                        })
                                                    }
                                                />
                                                <Label
                                                    htmlFor={`store-${index}`}
                                                >
                                                    Store
                                                </Label>
                                            </div>
                                        </div>
                                    ))}

                                    <Button
                                        variant="outline"
                                        onClick={addNewField}
                                        className="w-full"
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Another Field
                                    </Button>
                                </div>

                                <DialogFooter>
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setIsAddDialogOpen(false);
                                            setNewFields([]);
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handleAddFields}
                                        disabled={
                                            isAdding || newFields.length === 0
                                        }
                                    >
                                        {isAdding ? 'Adding...' : 'Add Fields'}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </CardHeader>
                <CardContent>
                    {fields.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            No fields found in this collection
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Field Name</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Facet</TableHead>
                                    <TableHead>Index</TableHead>
                                    <TableHead>Optional</TableHead>
                                    <TableHead>Sort</TableHead>
                                    <TableHead>Store</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {fields.map((field) => (
                                    <TableRow key={field.name}>
                                        <TableCell className="font-medium">
                                            {field.name}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant="secondary"
                                                className={getFieldTypeColor(
                                                    field.type,
                                                )}
                                            >
                                                {field.type}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {getFieldPropertyIcon(field.facet)}
                                        </TableCell>
                                        <TableCell>
                                            {getFieldPropertyIcon(field.index)}
                                        </TableCell>
                                        <TableCell>
                                            {getFieldPropertyIcon(
                                                field.optional,
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {getFieldPropertyIcon(field.sort)}
                                        </TableCell>
                                        <TableCell>
                                            {getFieldPropertyIcon(field.store)}
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
