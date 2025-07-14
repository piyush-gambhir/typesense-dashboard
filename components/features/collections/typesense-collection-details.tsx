'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { updateCollection } from '@/lib/typesense/collections';

import { toast } from '@/hooks/use-toast';

import CollectionConfiguration from './collection-details/collection-configuration';
import CollectionErrorBoundary from './collection-error-boundary';
import CollectionHeader from './collection-details/collection-header';
import CollectionNavigation from './collection-details/collection-navigation';
import CollectionOverviewStats from './collection-details/collection-overview-stats';
import CollectionQuickActions from './collection-details/collection-quick-actions';
import SchemaManagement from './collection-details/schema-management';

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


export default function TypesenseCollectionDetails({
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
        router.push(`/collections/${collection.name}/documents/import`);
    };

    const handleExportDocuments = () => {
        router.push(`/collections/${collection.name}/documents/export`);
    };

    // Handle edge cases
    if (!collection || !collection.name) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center space-y-4">
                    <h1 className="text-2xl font-bold text-destructive">Invalid Collection</h1>
                    <p className="text-muted-foreground">The collection data is invalid or missing.</p>
                </div>
            </div>
        );
    }

    return (
        <CollectionErrorBoundary>
            <CollectionNavigation collectionName={collection.name} />
            <div className="container mx-auto px-4 py-8 space-y-8">
                <CollectionHeader
                    name={collection.name}
                    numDocuments={collection.num_documents}
                    fieldsCount={collection.fields?.length || 0}
                    createdAt={collection.created_at}
                />

                <CollectionOverviewStats
                    numDocuments={collection.num_documents}
                    fieldsCount={collection.fields?.length || 0}
                    createdAt={collection.created_at}
                    enableNestedFields={collection.enable_nested_fields}
                    defaultSortingField={collection.default_sorting_field}
                    onNestedFieldsChange={handleNestedFieldsChange}
                />

                <CollectionConfiguration
                    fields={collection.fields || []}
                    defaultSortingField={collection.default_sorting_field}
                    enableNestedFields={collection.enable_nested_fields}
                    onDefaultSortingFieldChange={handleDefaultSortingFieldChange}
                    onNestedFieldsChange={handleNestedFieldsChange}
                />

                <CollectionQuickActions
                    collectionName={collection.name}
                    isJsonMode={isJsonMode}
                    onAddField={handleAddField}
                    onImportDocuments={handleImportDocuments}
                    onExportDocuments={handleExportDocuments}
                    onUpdateSchema={handleUpdateSchema}
                />

                <SchemaManagement
                    fields={collection.fields || []}
                    isJsonMode={isJsonMode}
                    jsonSchema={jsonSchema}
                    onJsonModeChange={setIsJsonMode}
                    onJsonSchemaChange={setJsonSchema}
                    onFieldChange={handleFieldChange}
                />
            </div>
        </CollectionErrorBoundary>
    );
}
