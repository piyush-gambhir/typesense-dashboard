'use client';

import { zodResolver } from '@hookform/resolvers/zod';

import {
    AlertTriangle,
    CheckCircle,
    FileUp,
    PlusCircle,
    Trash2,
    Upload,
    X,
} from 'lucide-react';
import { useState } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import * as z from 'zod';

import {
    createCollection,
    createCollectionWithJsonl,
    validateCollectionSchema,
} from '@/lib/typesense/collections';

import { toast } from '@/hooks/use-toast';

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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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

const fieldSchema = z.object({
    name: z.string().min(1, 'Field name is required'),
    type: z.enum(fieldTypes as [string, ...string[]]),
    facet: z.boolean(),
    index: z.boolean(),
    optional: z.boolean(),
    sort: z.boolean(),
    store: z.boolean(),
});

const formSchema = z.object({
    name: z.string().min(1, 'Collection name is required'),
    fields: z.array(fieldSchema).min(1, 'At least one field is required'),
    default_sorting_field: z.string().optional(),
    enable_nested_fields: z.boolean(),
});

type FormData = z.infer<typeof formSchema>;

interface ValidationResult {
    success: boolean;
    errors: string[];
    warnings: string[];
    schema: any;
}

interface CreateCollectionUnifiedProps {
    onSuccess?: () => void;
    mode?: 'dialog' | 'page';
}

export default function CreateCollectionUnified({
    onSuccess,
    mode = 'dialog',
}: CreateCollectionUnifiedProps) {
    const [activeTab, setActiveTab] = useState('manual');
    const [file, setFile] = useState<File | null>(null);
    const [validationResult, setValidationResult] =
        useState<ValidationResult | null>(null);
    const [isValidating, setIsValidating] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        control,
        handleSubmit,
        watch,
        setValue,
        reset,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            fields: [
                {
                    name: '',
                    type: 'string',
                    facet: false,
                    index: true,
                    optional: false,
                    sort: false,
                    store: true,
                },
            ],
            enable_nested_fields: false,
        },
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'fields',
    });

    const watchFields = watch('fields');
    const sortableFields = watchFields.filter((field) =>
        ['int32', 'int64', 'float'].includes(field.type),
    );

    // File upload handling for JSONL mode
    const handleFileChange = async (
        event: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const selectedFile = event.target.files?.[0];
        if (selectedFile) {
            if (
                selectedFile.type !== 'application/json' &&
                !selectedFile.name.endsWith('.jsonl')
            ) {
                toast({
                    title: 'Invalid file type',
                    description: 'Please select a JSON or JSONL file.',
                    variant: 'destructive',
                });
                return;
            }
            setFile(selectedFile);

            // Auto-extract collection name from filename
            const baseName = selectedFile.name.replace(/\.(json|jsonl)$/, '');
            setValue('name', baseName);
        }
    };

    const removeFile = () => {
        setFile(null);
        setValue('name', '');
    };

    // Validation for advanced mode
    const handleValidate = async () => {
        const formData = watch();
        setIsValidating(true);

        try {
            const result = await validateCollectionSchema({
                name: formData.name,
                fields: formData.fields.map((field) => ({
                    ...field,
                    type: field.type as any, // Type assertion for Typesense field types
                })),
                default_sorting_field: formData.default_sorting_field,
                enable_nested_fields: formData.enable_nested_fields,
            });

            setValidationResult(result);
        } catch (error) {
            toast({
                title: 'Validation Error',
                description: 'Failed to validate schema',
                variant: 'destructive',
            });
        } finally {
            setIsValidating(false);
        }
    };

    // Manual creation
    const handleManualSubmit = async (data: FormData) => {
        setIsCreating(true);

        try {
            const result = await createCollection({
                name: data.name,
                fields: data.fields.map((field) => ({
                    ...field,
                    type: field.type as any,
                })),
                default_sorting_field: data.default_sorting_field,
                enable_nested_fields: data.enable_nested_fields,
            });

            if (result) {
                toast({
                    title: 'Collection Created',
                    description: `Collection "${data.name}" has been created successfully.`,
                });
                reset();
                onSuccess?.();
            } else {
                throw new Error('Failed to create collection');
            }
        } catch (error) {
            toast({
                title: 'Error',
                description:
                    error instanceof Error
                        ? error.message
                        : 'Failed to create collection',
                variant: 'destructive',
            });
        } finally {
            setIsCreating(false);
        }
    };

    // JSONL creation
    const handleJsonlSubmit = async (data: FormData) => {
        if (!file) {
            toast({
                title: 'No file selected',
                description: 'Please select a JSONL file to upload.',
                variant: 'destructive',
            });
            return;
        }

        setIsLoading(true);

        try {
            const fileContent = await file.text();
            const result = await createCollectionWithJsonl({
                collectionName: data.name,
                fields: data.fields.map((field) => ({
                    ...field,
                    type: field.type as any,
                })),
                fileContent,
            });

            if (result?.success) {
                toast({
                    title: 'Collection Created',
                    description: `Collection "${data.name}" has been created with documents.`,
                });
                reset();
                setFile(null);
                onSuccess?.();
            } else {
                throw new Error(result?.error || 'Failed to create collection');
            }
        } catch (error) {
            toast({
                title: 'Error',
                description:
                    error instanceof Error
                        ? error.message
                        : 'Failed to create collection',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const onSubmit = (data: FormData) => {
        if (activeTab === 'jsonl') {
            handleJsonlSubmit(data);
        } else {
            handleManualSubmit(data);
        }
    };

    const addField = () => {
        append({
            name: '',
            type: 'string',
            facet: false,
            index: true,
            optional: false,
            sort: false,
            store: true,
        });
    };

    const renderFieldForm = () => (
        <div className="space-y-4">
            {fields.map((field, index) => (
                <Card key={field.id} className="border border-border">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium">
                                Field {index + 1}
                            </h4>
                            {fields.length > 1 && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => remove(index)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor={`field-${index}-name`}>
                                    Field Name
                                </Label>
                                <Input
                                    id={`field-${index}-name`}
                                    {...register(`fields.${index}.name`)}
                                    placeholder="Enter field name"
                                />
                                {errors.fields?.[index]?.name && (
                                    <p className="text-sm text-destructive mt-1">
                                        {errors.fields[index]?.name?.message}
                                    </p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor={`field-${index}-type`}>
                                    Field Type
                                </Label>
                                <Controller
                                    name={`fields.${index}.type`}
                                    control={control}
                                    render={({ field: controllerField }) => (
                                        <Select
                                            value={controllerField.value}
                                            onValueChange={
                                                controllerField.onChange
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {fieldTypes.map((type) => (
                                                    <SelectItem
                                                        key={type}
                                                        value={type}
                                                    >
                                                        {type}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            <div className="flex items-center space-x-2">
                                <Controller
                                    name={`fields.${index}.facet`}
                                    control={control}
                                    render={({ field: controllerField }) => (
                                        <Switch
                                            id={`field-${index}-facet`}
                                            checked={controllerField.value}
                                            onCheckedChange={
                                                controllerField.onChange
                                            }
                                        />
                                    )}
                                />
                                <Label
                                    htmlFor={`field-${index}-facet`}
                                    className="text-sm"
                                >
                                    Facet
                                </Label>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Controller
                                    name={`fields.${index}.index`}
                                    control={control}
                                    render={({ field: controllerField }) => (
                                        <Switch
                                            id={`field-${index}-index`}
                                            checked={controllerField.value}
                                            onCheckedChange={
                                                controllerField.onChange
                                            }
                                        />
                                    )}
                                />
                                <Label
                                    htmlFor={`field-${index}-index`}
                                    className="text-sm"
                                >
                                    Index
                                </Label>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Controller
                                    name={`fields.${index}.optional`}
                                    control={control}
                                    render={({ field: controllerField }) => (
                                        <Switch
                                            id={`field-${index}-optional`}
                                            checked={controllerField.value}
                                            onCheckedChange={
                                                controllerField.onChange
                                            }
                                        />
                                    )}
                                />
                                <Label
                                    htmlFor={`field-${index}-optional`}
                                    className="text-sm"
                                >
                                    Optional
                                </Label>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Controller
                                    name={`fields.${index}.sort`}
                                    control={control}
                                    render={({ field: controllerField }) => (
                                        <Switch
                                            id={`field-${index}-sort`}
                                            checked={controllerField.value}
                                            onCheckedChange={
                                                controllerField.onChange
                                            }
                                        />
                                    )}
                                />
                                <Label
                                    htmlFor={`field-${index}-sort`}
                                    className="text-sm"
                                >
                                    Sort
                                </Label>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Controller
                                    name={`fields.${index}.store`}
                                    control={control}
                                    render={({ field: controllerField }) => (
                                        <Switch
                                            id={`field-${index}-store`}
                                            checked={controllerField.value}
                                            onCheckedChange={
                                                controllerField.onChange
                                            }
                                        />
                                    )}
                                />
                                <Label
                                    htmlFor={`field-${index}-store`}
                                    className="text-sm"
                                >
                                    Store
                                </Label>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}

            <Button
                type="button"
                variant="outline"
                onClick={addField}
                className="w-full"
            >
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Field
            </Button>
        </div>
    );

    const renderJsonlUpload = () => (
        <div className="space-y-4">
            <div className="border-2 border-dashed border-border rounded-lg p-6">
                {file ? (
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <FileUp className="h-5 w-5 text-muted-foreground" />
                            <span className="text-sm font-medium">
                                {file.name}
                            </span>
                            <Badge variant="secondary">
                                {(file.size / 1024).toFixed(1)} KB
                            </Badge>
                        </div>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={removeFile}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                ) : (
                    <div className="text-center">
                        <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                        <div className="mt-4">
                            <Label
                                htmlFor="file-upload"
                                className="cursor-pointer"
                            >
                                <span className="text-primary hover:text-primary/80">
                                    Click to upload
                                </span>{' '}
                                or drag and drop
                            </Label>
                            <Input
                                id="file-upload"
                                type="file"
                                accept=".json,.jsonl"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                            JSON or JSONL files only
                        </p>
                    </div>
                )}
            </div>

            {renderFieldForm()}
        </div>
    );

    const renderAdvancedOptions = () => (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="default-sorting-field">
                        Default Sorting Field
                    </Label>
                    <Controller
                        name="default_sorting_field"
                        control={control}
                        render={({ field }) => (
                            <Select
                                value={field.value || ''}
                                onValueChange={field.onChange}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a field" />
                                </SelectTrigger>
                                <SelectContent>
                                    {sortableFields.map((sortField) => (
                                        <SelectItem
                                            key={sortField.name}
                                            value={sortField.name}
                                        >
                                            {sortField.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                </div>

                <div className="flex items-center space-x-2">
                    <Controller
                        name="enable_nested_fields"
                        control={control}
                        render={({ field }) => (
                            <Switch
                                id="nested-fields"
                                checked={field.value}
                                onCheckedChange={field.onChange}
                            />
                        )}
                    />
                    <Label htmlFor="nested-fields">Enable Nested Fields</Label>
                </div>
            </div>

            {activeTab === 'advanced' && (
                <div className="border-t pt-4">
                    <div className="flex gap-2 mb-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleValidate}
                            disabled={isValidating}
                        >
                            {isValidating ? 'Validating...' : 'Validate Schema'}
                        </Button>
                    </div>

                    {validationResult && (
                        <ScrollArea className="h-32">
                            <div className="space-y-2">
                                {validationResult.success ? (
                                    <Alert>
                                        <CheckCircle className="h-4 w-4" />
                                        <AlertDescription>
                                            Schema validation passed
                                            successfully!
                                        </AlertDescription>
                                    </Alert>
                                ) : (
                                    <Alert variant="destructive">
                                        <AlertTriangle className="h-4 w-4" />
                                        <AlertDescription>
                                            Validation failed:{' '}
                                            {validationResult.errors.join(', ')}
                                        </AlertDescription>
                                    </Alert>
                                )}

                                {validationResult.warnings.length > 0 && (
                                    <Alert>
                                        <AlertTriangle className="h-4 w-4" />
                                        <AlertDescription>
                                            Warnings:{' '}
                                            {validationResult.warnings.join(
                                                ', ',
                                            )}
                                        </AlertDescription>
                                    </Alert>
                                )}
                            </div>
                        </ScrollArea>
                    )}
                </div>
            )}
        </div>
    );

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
                <Label htmlFor="collection-name">Collection Name</Label>
                <Input
                    id="collection-name"
                    {...register('name')}
                    placeholder="Enter collection name"
                />
                {errors.name && (
                    <p className="text-sm text-destructive mt-1">
                        {errors.name.message}
                    </p>
                )}
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="manual">Manual</TabsTrigger>
                    <TabsTrigger value="jsonl">Upload JSONL</TabsTrigger>
                    <TabsTrigger value="advanced">Advanced</TabsTrigger>
                </TabsList>

                <TabsContent value="manual" className="space-y-4">
                    {renderFieldForm()}
                    {renderAdvancedOptions()}
                </TabsContent>

                <TabsContent value="jsonl" className="space-y-4">
                    {renderJsonlUpload()}
                    {renderAdvancedOptions()}
                </TabsContent>

                <TabsContent value="advanced" className="space-y-4">
                    {renderFieldForm()}
                    {renderAdvancedOptions()}
                </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-2">
                <Button
                    type="submit"
                    disabled={isCreating || isLoading}
                    className="min-w-[120px]"
                >
                    {isCreating || isLoading
                        ? 'Creating...'
                        : 'Create Collection'}
                </Button>
            </div>
        </form>
    );
}
