'use client';

import Editor from '@monaco-editor/react';

import { 
    ArrowRightFromLineIcon, 
    Calendar,
    Database,
    Download,
    FileText, 
    Hash,
    Import, 
    PlusCircle,
    Settings,
    ToggleLeft,
    Upload
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { updateCollection } from '@/lib/typesense/collections';
import { cn } from '@/lib/utils';

import { toast } from '@/hooks/useToast';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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

import DeleteCollectionDialog from '@/components/features/collections/DeleteCollectionDialog';

interface Field {
    name: string;
    type: string;
    facet?: boolean;
    index?: boolean;
    optional?: boolean;
    sort?: boolean;
    store?: boolean;
}

interface CollectionDetails {
    name: string;
    created_at: number;
    num_documents: number;
    default_sorting_field?: string;
    enable_nested_fields?: boolean;
    fields: Field[];
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
];

export default function CollectionDetails({
    initialCollection,
}: Readonly<{
    initialCollection: CollectionDetails;
}>) {
    const router = useRouter();
    const [collection, setCollection] =
        useState<CollectionDetails>(initialCollection);
    const [isJsonMode, setIsJsonMode] = useState(false);
    const [jsonSchema, setJsonSchema] = useState(
        JSON.stringify(collection, null, 2),
    );

    const handleFieldChange = (
        index: number,
        key: keyof Field,
        value: boolean | string,
    ) => {
        const updatedFields = [...collection.fields];
        updatedFields[index] = { ...updatedFields[index], [key]: value };
        setCollection({ ...collection, fields: updatedFields });
    };

    const handleUpdateSchema = async () => {
        try {
            let updatedCollectionData;
            if (isJsonMode) {
                try {
                    updatedCollectionData = JSON.parse(jsonSchema);
                } catch {
                    toast({
                        title: 'JSON Parse Error',
                        description:
                            'Invalid JSON format. Please check your schema.',
                        variant: 'destructive',
                    });
                    return;
                }
            } else {
                updatedCollectionData = collection; // Schema is already updated in state for table mode
            }

            console.log('Sending update data:', updatedCollectionData);

            const updatedCollection = await updateCollection(
                collection.name,
                updatedCollectionData,
            );

            if (updatedCollection) {
                setCollection(updatedCollection as CollectionDetails);
                toast({
                    title: 'Schema Updated',
                    description:
                        'The collection schema has been updated successfully.',
                });
            } else {
                toast({
                    title: 'Error',
                    description:
                        "Failed to update collection schema. This might be because you're trying to modify existing fields, which is not allowed in Typesense. Check the console for details.",
                    variant: 'destructive',
                });
            }
        } catch (error) {
            console.error('Update schema error:', error);
            toast({
                title: 'Error',
                description: `Failed to update collection schema: ${
                    error instanceof Error ? error.message : 'Unknown error'
                }`,
                variant: 'destructive',
            });
        }
    };

    const handleAddField = () => {
        const newField: Field = {
            name: `new_field_${collection.fields.length + 1}`,
            type: 'string',
            facet: false,
            index: true,
            optional: true,
            sort: false,
            store: true,
        };
        setCollection({
            ...collection,
            fields: [...collection.fields, newField],
        });
    };

    const handleDefaultSortingFieldChange = (value: string) => {
        setCollection({ ...collection, default_sorting_field: value });
    };

    const handleNestedFieldsChange = (checked: boolean) => {
        setCollection({ ...collection, enable_nested_fields: checked });
    };

    const handleImportDocuments = () => {
        router.push(`collections/${collection.name}/documents/import`);
    };

    const handleExportDocuments = () => {
        router.push(`collections/${collection.name}/documents/export`);
    };

    return (
        <div className="container mx-auto px-4 py-8 space-y-8">
            {/* Header Section */}
            <div className="flex items-start justify-between">
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl ring-1 ring-primary/20">
                            <Database className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">{collection.name}</h1>
                            <p className="text-muted-foreground">Collection overview and schema management</p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="gap-1">
                        <FileText className="h-3 w-3" />
                        {collection.num_documents.toLocaleString()} documents
                    </Badge>
                    <Badge variant="outline" className="gap-1">
                        <Hash className="h-3 w-3" />
                        {collection.fields.length} fields
                    </Badge>
                </div>
            </div>

            {/* Overview Stats */}
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
                            {collection.num_documents.toLocaleString()}
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
                            {collection.fields.length}
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
                            {Math.ceil((Date.now() - collection.created_at * 1000) / (1000 * 60 * 60 * 24))}d
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {new Date(collection.created_at * 1000).toLocaleDateString()}
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
                                    checked={collection.enable_nested_fields}
                                    onCheckedChange={handleNestedFieldsChange}
                                    size="sm"
                                />
                            </div>
                            <div className="text-xs text-muted-foreground">
                                Sort: {collection.default_sorting_field || 'None'}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Configuration Section */}
            <Card className="border border-border/50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Settings className="h-5 w-5" />
                        Collection Configuration
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <label className="text-sm font-medium">Default Sorting Field</label>
                            <Select
                                value={collection.default_sorting_field}
                                onValueChange={handleDefaultSortingFieldChange}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a field" />
                                </SelectTrigger>
                                <SelectContent>
                                    {collection.fields.map((field) => (
                                        <SelectItem key={field.name} value={field.name}>
                                            {field.name} ({field.type})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-3">
                            <label className="text-sm font-medium">Enable Nested Fields</label>
                            <div className="flex items-center gap-2">
                                <Switch
                                    checked={collection.enable_nested_fields}
                                    onCheckedChange={handleNestedFieldsChange}
                                />
                                <span className="text-sm text-muted-foreground">
                                    {collection.enable_nested_fields ? 'Enabled' : 'Disabled'}
                                </span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border border-border/50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Upload className="h-5 w-5" />
                        Quick Actions
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Button
                            onClick={handleAddField}
                            disabled={isJsonMode}
                            variant="outline"
                            className="justify-start gap-2 h-auto p-4"
                        >
                            <div className="p-2 bg-blue-500/10 rounded-lg">
                                <PlusCircle className="w-4 h-4 text-blue-600" />
                            </div>
                            <div className="text-left">
                                <div className="font-medium">Add Field</div>
                                <div className="text-xs text-muted-foreground">Extend schema</div>
                            </div>
                        </Button>
                        
                        <Button
                            onClick={handleImportDocuments}
                            variant="outline"
                            className="justify-start gap-2 h-auto p-4"
                        >
                            <div className="p-2 bg-emerald-500/10 rounded-lg">
                                <Import className="w-4 h-4 text-emerald-600" />
                            </div>
                            <div className="text-left">
                                <div className="font-medium">Import Documents</div>
                                <div className="text-xs text-muted-foreground">Bulk upload data</div>
                            </div>
                        </Button>
                        
                        <Button
                            onClick={handleExportDocuments}
                            variant="outline"
                            className="justify-start gap-2 h-auto p-4"
                        >
                            <div className="p-2 bg-amber-500/10 rounded-lg">
                                <Download className="w-4 h-4 text-amber-600" />
                            </div>
                            <div className="text-left">
                                <div className="font-medium">Export Documents</div>
                                <div className="text-xs text-muted-foreground">Download data</div>
                            </div>
                        </Button>
                    </div>
                    
                    <Separator className="my-6" />
                    
                    <div className="flex items-center justify-between">
                        <div className="flex gap-3">
                            <Button
                                onClick={handleUpdateSchema}
                                className="bg-gradient-to-r from-primary to-primary/90 shadow-lg"
                            >
                                <Settings className="w-4 h-4 mr-2" />
                                Update Schema
                            </Button>
                        </div>
                        <DeleteCollectionDialog collectionName={collection.name} />
                    </div>
                </CardContent>
            </Card>

            {/* Schema Management */}
            <Card className="border border-border/50">
                <CardHeader>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                            <CardTitle className="flex items-center gap-2">
                                <Hash className="h-5 w-5" />
                                Schema Fields
                            </CardTitle>
                            <p className="text-sm text-muted-foreground">
                                Manage your collection's field schema and properties
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 bg-muted/50 rounded-lg p-1">
                                <button
                                    onClick={() => setIsJsonMode(false)}
                                    className={cn(
                                        "px-3 py-1 text-sm font-medium rounded-md transition-colors",
                                        !isJsonMode ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    Table
                                </button>
                                <button
                                    onClick={() => setIsJsonMode(true)}
                                    className={cn(
                                        "px-3 py-1 text-sm font-medium rounded-md transition-colors",
                                        isJsonMode ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    JSON
                                </button>
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <Alert>
                        <ToggleLeft className="h-4 w-4" />
                        <AlertDescription>
                            <strong>Schema Limitations:</strong> Typesense only allows adding new fields to existing collections. 
                            You cannot modify field types, delete existing fields, or change existing field properties. 
                            To change field properties, you'll need to recreate the collection.
                        </AlertDescription>
                    </Alert>
                    {isJsonMode ? (
                        <div className="border rounded-xl overflow-hidden bg-gradient-to-br from-background to-muted/20">
                            <Editor
                                height="500px"
                                defaultLanguage="json"
                                value={jsonSchema}
                                onChange={(value) => setJsonSchema(value || '')}
                                options={{
                                    minimap: { enabled: false },
                                    fontSize: 14,
                                    lineNumbers: 'on',
                                    roundedSelection: false,
                                    scrollBeyondLastLine: false,
                                    automaticLayout: true,
                                    theme: 'vs-dark',
                                    wordWrap: 'on',
                                    padding: { top: 16, bottom: 16 },
                                }}
                            />
                        </div>
                    ) : (
                        <div className="border rounded-xl overflow-hidden bg-gradient-to-br from-background to-muted/20">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-muted/50">
                                            <TableHead className="font-semibold">Field Name</TableHead>
                                            <TableHead className="font-semibold">Data Type</TableHead>
                                            <TableHead className="font-semibold text-center">Facet</TableHead>
                                            <TableHead className="font-semibold text-center">Index</TableHead>
                                            <TableHead className="font-semibold text-center">Optional</TableHead>
                                            <TableHead className="font-semibold text-center">Sort</TableHead>
                                            <TableHead className="font-semibold text-center">Store</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {collection.fields.map((field, index) => {
                                            // Check if this is a new field (added by user) or existing field
                                            const isNewField = field.name.startsWith('new_field_');

                                            return (
                                                <TableRow key={field.name} className="border-border/50">
                                                    <TableCell className="font-medium">
                                                        {isNewField ? (
                                                            <Input
                                                                value={field.name}
                                                                onChange={(e) =>
                                                                    handleFieldChange(
                                                                        index,
                                                                        'name',
                                                                        e.target.value,
                                                                    )
                                                                }
                                                                className="w-full"
                                                                placeholder="Enter field name"
                                                            />
                                                        ) : (
                                                            <div className="flex items-center gap-2">
                                                                <Badge variant="outline" className="font-mono text-xs">
                                                                    {field.name}
                                                                </Badge>
                                                            </div>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        {isNewField ? (
                                                            <Select
                                                                value={field.type}
                                                                onValueChange={(value) =>
                                                                    handleFieldChange(index, 'type', value)
                                                                }
                                                            >
                                                                <SelectTrigger className="w-full">
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {fieldTypes.map((type) => (
                                                                        <SelectItem key={type} value={type}>
                                                                            <code className="text-xs">{type}</code>
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        ) : (
                                                            <Badge variant="secondary" className="font-mono text-xs">
                                                                {field.type}
                                                            </Badge>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <Switch
                                                            checked={field.facet}
                                                            onCheckedChange={(checked) =>
                                                                handleFieldChange(index, 'facet', checked)
                                                            }
                                                            disabled={!isNewField}
                                                        />
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <Switch
                                                            checked={field.index}
                                                            onCheckedChange={(checked) =>
                                                                handleFieldChange(index, 'index', checked)
                                                            }
                                                            disabled={!isNewField}
                                                        />
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <Switch
                                                            checked={field.optional}
                                                            onCheckedChange={(checked) =>
                                                                handleFieldChange(index, 'optional', checked)
                                                            }
                                                            disabled={!isNewField}
                                                        />
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <Switch
                                                            checked={field.sort}
                                                            onCheckedChange={(checked) =>
                                                                handleFieldChange(index, 'sort', checked)
                                                            }
                                                            disabled={!isNewField}
                                                        />
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <Switch
                                                            checked={field.store}
                                                            onCheckedChange={(checked) =>
                                                                handleFieldChange(index, 'store', checked)
                                                            }
                                                            disabled={!isNewField}
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
