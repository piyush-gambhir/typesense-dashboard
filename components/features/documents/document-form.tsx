'use client';

import { zodResolver } from '@hookform/resolvers/zod';

import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { getCollection } from '@/lib/typesense/collections';
import {
    createDocument,
    getDocumentById,
    updateDocument,
} from '@/lib/typesense/documents';

import { toast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';

interface CollectionField {
    name: string;
    type: string;
    optional?: boolean;
}

interface CollectionSchema {
    fields: CollectionField[];
}

interface DocumentFormProps {
    collectionName: string;
    documentId?: string;
    mode: 'create' | 'edit';
    onSuccess?: () => void;
}

export default function DocumentForm({
    collectionName,
    documentId,
    mode,
    onSuccess,
}: DocumentFormProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [documentData, setDocumentData] = useState<Record<
        string,
        unknown
    > | null>(null);
    const [collectionSchema, setCollectionSchema] =
        useState<CollectionSchema | null>(null);
    const [formSchema, setFormSchema] = useState<z.ZodObject<
        Record<string, z.ZodTypeAny>
    > | null>(null);

    const form = useForm<Record<string, unknown>>({
        resolver: formSchema ? zodResolver(formSchema) : undefined,
        defaultValues: {},
    });

    // Generate dynamic form schema based on collection fields
    const generateFormSchema = useCallback(
        (fields: CollectionField[]) => {
            const dynamicSchema: Record<string, z.ZodTypeAny> = {};

            fields.forEach((field: CollectionField) => {
                if (mode === 'create' && field.name === 'id') return; // Skip ID for creation

                let fieldSchema: z.ZodTypeAny;

                switch (field.type) {
                    case 'string':
                        fieldSchema = z.string();
                        break;
                    case 'int32':
                    case 'int64':
                    case 'float':
                        fieldSchema = z.number();
                        break;
                    case 'bool':
                        fieldSchema = z.boolean();
                        break;
                    case 'string[]':
                        fieldSchema = z.array(z.string());
                        break;
                    case 'int32[]':
                    case 'int64[]':
                    case 'float[]':
                        fieldSchema = z.array(z.number());
                        break;
                    case 'bool[]':
                        fieldSchema = z.array(z.boolean());
                        break;
                    case 'object':
                        fieldSchema = z.record(z.string(), z.unknown());
                        break;
                    case 'object[]':
                        fieldSchema = z.array(
                            z.record(z.string(), z.unknown()),
                        );
                        break;
                    default:
                        fieldSchema = z.unknown();
                }

                // Handle optional fields
                if (field.optional) {
                    fieldSchema = fieldSchema.optional();
                }

                dynamicSchema[field.name] = fieldSchema;
            });

            return z.object(dynamicSchema);
        },
        [mode],
    );

    // Fetch data based on mode
    useEffect(() => {
        const fetchData = async () => {
            setIsInitialLoading(true);

            try {
                if (mode === 'edit' && documentId) {
                    // Edit mode: fetch both document and schema
                    const [doc, schemaResult] = await Promise.all([
                        getDocumentById(collectionName, documentId),
                        getCollection(collectionName),
                    ]);

                    if (doc && schemaResult?.success && schemaResult.data) {
                        const schema = schemaResult.data;
                        const formData = doc as Record<string, unknown>;

                        setDocumentData(formData);
                        setCollectionSchema(schema);

                        const dynamicSchema = generateFormSchema(
                            schema.fields || [],
                        );
                        setFormSchema(dynamicSchema);

                        // Reset form with fetched data
                        form.reset(formData);
                    } else {
                        toast({
                            title: 'Error',
                            description:
                                'Failed to load document or collection schema',
                            variant: 'destructive',
                        });
                    }
                } else {
                    // Create mode: only fetch schema
                    const schemaResult = await getCollection(collectionName);

                    if (schemaResult?.success && schemaResult.data) {
                        const schema = schemaResult.data;
                        setCollectionSchema(schema);

                        const dynamicSchema = generateFormSchema(
                            schema.fields || [],
                        );
                        setFormSchema(dynamicSchema);

                        // Set default values for create mode
                        const defaultValues: Record<string, unknown> = {};
                        schema.fields?.forEach((field: CollectionField) => {
                            if (field.name === 'id') return;

                            switch (field.type) {
                                case 'string':
                                    defaultValues[field.name] = '';
                                    break;
                                case 'int32':
                                case 'int64':
                                case 'float':
                                    defaultValues[field.name] = 0;
                                    break;
                                case 'bool':
                                    defaultValues[field.name] = false;
                                    break;
                                case 'string[]':
                                case 'int32[]':
                                case 'int64[]':
                                case 'float[]':
                                case 'bool[]':
                                    defaultValues[field.name] = [];
                                    break;
                                case 'object':
                                case 'object[]':
                                    defaultValues[field.name] =
                                        field.type === 'object[]' ? [] : {};
                                    break;
                                default:
                                    defaultValues[field.name] = '';
                            }
                        });

                        form.reset(defaultValues);
                    }
                }
            } catch (error) {
                toast({
                    title: 'Error',
                    description: 'Failed to load data',
                    variant: 'destructive',
                });
            } finally {
                setIsInitialLoading(false);
            }
        };

        fetchData();
    }, [collectionName, documentId, mode, form, generateFormSchema]);

    const onSubmit = async (data: Record<string, unknown>) => {
        setIsLoading(true);

        try {
            let result;

            if (mode === 'create') {
                result = await createDocument(collectionName, data);
            } else if (documentId) {
                result = await updateDocument(collectionName, documentId, data);
            }

            if (result) {
                toast({
                    title: 'Success',
                    description: `Document ${mode === 'create' ? 'created' : 'updated'} successfully`,
                });

                if (onSuccess) {
                    onSuccess();
                } else {
                    router.push(`/collections/${collectionName}/documents`);
                }
            } else {
                throw new Error(`Failed to ${mode} document`);
            }
        } catch (error) {
            toast({
                title: 'Error',
                description:
                    error instanceof Error
                        ? error.message
                        : `Failed to ${mode} document`,
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Render field based on type
    const renderField = (field: CollectionField) => {
        const fieldName = field.name;
        const isReadOnly = mode === 'edit' && field.name === 'id';

        return (
            <FormField
                key={fieldName}
                control={form.control}
                name={fieldName}
                render={({ field: formField }) => (
                    <FormItem>
                        <FormLabel>
                            {fieldName}
                            {field.optional && (
                                <span className="text-muted-foreground ml-1">
                                    (optional)
                                </span>
                            )}
                        </FormLabel>
                        <FormControl>
                            {(() => {
                                switch (field.type) {
                                    case 'bool':
                                        return (
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    checked={Boolean(
                                                        formField.value,
                                                    )}
                                                    onCheckedChange={
                                                        formField.onChange
                                                    }
                                                    disabled={isReadOnly}
                                                />
                                                <span className="text-sm">
                                                    {Boolean(formField.value)
                                                        ? 'True'
                                                        : 'False'}
                                                </span>
                                            </div>
                                        );

                                    case 'int32':
                                    case 'int64':
                                    case 'float':
                                        return (
                                            <Input
                                                type="number"
                                                step={
                                                    field.type === 'float'
                                                        ? 'any'
                                                        : '1'
                                                }
                                                value={
                                                    (formField.value as number) ||
                                                    ''
                                                }
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    formField.onChange(
                                                        val === ''
                                                            ? 0
                                                            : Number(val),
                                                    );
                                                }}
                                                readOnly={isReadOnly}
                                            />
                                        );

                                    case 'string[]':
                                    case 'int32[]':
                                    case 'int64[]':
                                    case 'float[]':
                                    case 'bool[]':
                                        return (
                                            <Textarea
                                                placeholder={`Enter ${field.type} values (one per line)`}
                                                value={
                                                    Array.isArray(
                                                        formField.value,
                                                    )
                                                        ? formField.value.join(
                                                              '\n',
                                                          )
                                                        : ''
                                                }
                                                onChange={(e) => {
                                                    const lines = e.target.value
                                                        .split('\n')
                                                        .filter((line) =>
                                                            line.trim(),
                                                        );
                                                    if (
                                                        field.type ===
                                                        'string[]'
                                                    ) {
                                                        formField.onChange(
                                                            lines,
                                                        );
                                                    } else if (
                                                        field.type.includes(
                                                            'int',
                                                        ) ||
                                                        field.type.includes(
                                                            'float',
                                                        )
                                                    ) {
                                                        formField.onChange(
                                                            lines
                                                                .map(Number)
                                                                .filter(
                                                                    (n) =>
                                                                        !isNaN(
                                                                            n,
                                                                        ),
                                                                ),
                                                        );
                                                    } else if (
                                                        field.type === 'bool[]'
                                                    ) {
                                                        formField.onChange(
                                                            lines.map(
                                                                (l) =>
                                                                    l.toLowerCase() ===
                                                                    'true',
                                                            ),
                                                        );
                                                    }
                                                }}
                                                readOnly={isReadOnly}
                                            />
                                        );

                                    case 'object':
                                    case 'object[]':
                                        return (
                                            <Textarea
                                                placeholder="Enter JSON object"
                                                value={
                                                    typeof formField.value ===
                                                    'object'
                                                        ? JSON.stringify(
                                                              formField.value,
                                                              null,
                                                              2,
                                                          )
                                                        : ''
                                                }
                                                onChange={(e) => {
                                                    try {
                                                        const parsed =
                                                            JSON.parse(
                                                                e.target.value,
                                                            );
                                                        formField.onChange(
                                                            parsed,
                                                        );
                                                    } catch {
                                                        // Invalid JSON, keep the text as is
                                                        formField.onChange(
                                                            e.target.value,
                                                        );
                                                    }
                                                }}
                                                readOnly={isReadOnly}
                                            />
                                        );

                                    default:
                                        return (
                                            <Input
                                                value={String(
                                                    formField.value || '',
                                                )}
                                                onChange={(e) =>
                                                    formField.onChange(
                                                        e.target.value,
                                                    )
                                                }
                                                readOnly={isReadOnly}
                                            />
                                        );
                                }
                            })()}
                        </FormControl>
                        <FormDescription>Type: {field.type}</FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />
        );
    };

    if (isInitialLoading) {
        return (
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-64" />
                </CardHeader>
                <CardContent className="space-y-6">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="space-y-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                    ))}
                </CardContent>
                <CardFooter>
                    <Skeleton className="h-10 w-32" />
                </CardFooter>
            </Card>
        );
    }

    if (!collectionSchema || !formSchema) {
        return (
            <Card>
                <CardContent className="text-center py-8">
                    <p className="text-muted-foreground">
                        Failed to load collection schema
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>
                    {mode === 'create' ? 'Create Document' : 'Edit Document'}
                </CardTitle>
                <CardDescription>
                    {mode === 'create'
                        ? `Add a new document to the "${collectionName}" collection`
                        : `Update document in the "${collectionName}" collection`}
                </CardDescription>
            </CardHeader>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <CardContent className="space-y-6">
                        <div className="grid gap-6">
                            {collectionSchema.fields?.map((field) =>
                                renderField(field),
                            )}
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.back()}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            {mode === 'create'
                                ? 'Create Document'
                                : 'Update Document'}
                        </Button>
                    </CardFooter>
                </form>
            </Form>
        </Card>
    );
}
