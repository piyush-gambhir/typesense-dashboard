'use client';

import { zodResolver } from '@hookform/resolvers/zod';

import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { getCollection } from '@/lib/typesense/collections';
import { getDocumentById, updateDocument } from '@/lib/typesense/documents';

import { toast } from '@/hooks/useToast';

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
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export default function EditDocumentPage({
    collectionName,
    documentId,
}: Readonly<{
    collectionName: string;
    documentId: string;
}>) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    interface CollectionField {
        name: string;
        type: string;
        optional?: boolean;
    }

    interface CollectionSchema {
        fields: CollectionField[];
    }

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
        defaultValues: documentData || {},
    });

    useEffect(() => {
        const fetchData = async () => {
            const [doc, schemaResult] = await Promise.all([
                getDocumentById(collectionName, documentId),
                getCollection(collectionName),
            ]);

            if (
                doc &&
                schemaResult &&
                schemaResult.success &&
                schemaResult.data
            ) {
                const schema = schemaResult.data;
                setDocumentData(doc as Record<string, unknown>);
                setCollectionSchema(schema);

                const dynamicSchema: Record<string, z.ZodTypeAny> = {};
                schema.fields?.forEach((field: CollectionField) => {
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
                        default:
                            fieldSchema = z.any();
                    }
                    if (field.optional) {
                        fieldSchema = fieldSchema.optional();
                    }
                    dynamicSchema[field.name] = fieldSchema;
                });
                setFormSchema(z.object(dynamicSchema));
                form.reset(doc); // Reset form with fetched data
            } else {
                toast({
                    title: 'Error',
                    description:
                        schemaResult?.error ||
                        'Failed to load document or collection schema.',
                    variant: 'destructive',
                });
            }
        };
        fetchData();
    }, [collectionName, documentId]);

    async function onSubmit(values: Record<string, unknown>) {
        setIsLoading(true);
        try {
            const updatedDoc = await updateDocument(
                collectionName,
                documentId,
                values,
            );
            if (updatedDoc) {
                toast({
                    title: 'Document updated',
                    description: 'Your document has been successfully updated.',
                });
                router.push(`/collections/${collectionName}/search`); // Redirect to search page
            } else {
                toast({
                    title: 'Error',
                    description: 'Failed to update document.',
                    variant: 'destructive',
                });
            }
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error?.message || 'Failed to update document',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    }

    if (!documentData || !collectionSchema || !formSchema) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 animate-spin" />
            </div>
        );
    }

    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>Edit Document</CardTitle>
                <CardDescription>
                    Make changes to your document here. Click save when
                    you&apos;re done.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-8"
                    >
                        {collectionSchema.fields.map((field: any) => {
                            if (field.name === 'id') return null; // Skip ID field for editing
                            return (
                                <FormField
                                    key={field.name}
                                    control={form.control}
                                    name={field.name}
                                    render={({ field: formField }) => (
                                        <FormItem>
                                            <FormLabel>{field.name}</FormLabel>
                                            <FormControl>
                                                {field.type === 'string' ? (
                                                    <Input
                                                        placeholder={`Enter ${field.name}`}
                                                        {...formField}
                                                        value={String(
                                                            formField.value ||
                                                                '',
                                                        )}
                                                    />
                                                ) : field.type === 'int32' ||
                                                  field.type === 'int64' ||
                                                  field.type === 'float' ? (
                                                    <Input
                                                        type="number"
                                                        placeholder={`Enter ${field.name}`}
                                                        {...formField}
                                                        value={String(
                                                            formField.value ||
                                                                '',
                                                        )}
                                                        onChange={(e) =>
                                                            formField.onChange(
                                                                parseFloat(
                                                                    e.target
                                                                        .value,
                                                                ),
                                                            )
                                                        }
                                                    />
                                                ) : field.type === 'bool' ? (
                                                    <Input
                                                        type="checkbox"
                                                        checked={Boolean(
                                                            formField.value,
                                                        )}
                                                        onChange={(e) =>
                                                            formField.onChange(
                                                                e.target
                                                                    .checked,
                                                            )
                                                        }
                                                    />
                                                ) : field.type ===
                                                  'string[]' ? (
                                                    <Textarea
                                                        placeholder={`Enter ${field.name} (comma-separated)`}
                                                        {...formField}
                                                        value={
                                                            (Array.isArray(
                                                                formField.value,
                                                            )
                                                                ? formField.value.join(
                                                                      ', ',
                                                                  )
                                                                : '') || ''
                                                        }
                                                        onChange={(e) =>
                                                            formField.onChange(
                                                                e.target.value
                                                                    .split(',')
                                                                    .map(
                                                                        (
                                                                            s: string,
                                                                        ) =>
                                                                            s.trim(),
                                                                    ),
                                                            )
                                                        }
                                                    />
                                                ) : field.type === 'int32[]' ||
                                                  field.type === 'int64[]' ||
                                                  field.type === 'float[]' ? (
                                                    <Textarea
                                                        placeholder={`Enter ${field.name} (comma-separated numbers)`}
                                                        {...formField}
                                                        value={
                                                            (Array.isArray(
                                                                formField.value,
                                                            )
                                                                ? formField.value.join(
                                                                      ', ',
                                                                  )
                                                                : '') || ''
                                                        }
                                                        onChange={(e) =>
                                                            formField.onChange(
                                                                e.target.value
                                                                    .split(',')
                                                                    .map(
                                                                        (
                                                                            s: string,
                                                                        ) =>
                                                                            parseFloat(
                                                                                s.trim(),
                                                                            ),
                                                                    ),
                                                            )
                                                        }
                                                    />
                                                ) : field.type === 'bool[]' ? (
                                                    <Textarea
                                                        placeholder={`Enter ${field.name} (comma-separated booleans)`}
                                                        {...formField}
                                                        value={
                                                            (Array.isArray(
                                                                formField.value,
                                                            )
                                                                ? formField.value.join(
                                                                      ', ',
                                                                  )
                                                                : '') || ''
                                                        }
                                                        onChange={(e) =>
                                                            formField.onChange(
                                                                e.target.value
                                                                    .split(',')
                                                                    .map(
                                                                        (
                                                                            s: string,
                                                                        ) =>
                                                                            s.trim() ===
                                                                            'true',
                                                                    ),
                                                            )
                                                        }
                                                    />
                                                ) : (
                                                    <Input
                                                        placeholder={`Enter ${field.name}`}
                                                        {...formField}
                                                        value={String(
                                                            formField.value ||
                                                                '',
                                                        )}
                                                    />
                                                )}
                                            </FormControl>
                                            <FormDescription>
                                                This is the {field.name} of your
                                                document.
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            );
                        })}
                        <Button
                            type="submit"
                            onClick={form.handleSubmit(onSubmit)}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </form>
                </Form>
            </CardContent>
            <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => router.back()}>
                    Cancel
                </Button>
            </CardFooter>
        </Card>
    );
}
