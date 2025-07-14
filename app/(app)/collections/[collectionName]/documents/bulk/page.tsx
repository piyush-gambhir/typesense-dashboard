import { Terminal } from 'lucide-react';
import React from 'react';

import { getCollection } from '@/lib/typesense/collections';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

import BulkOperations from '@/components/features/documents/bulk-operations';
import CollectionHeader from '@/components/features/collections/collection-details/collection-header';
import CollectionNavigation from '@/components/features/collections/collection-details/collection-navigation';

export default async function BulkOperationsPage({
    params,
}: {
    params: Promise<{ collectionName: string }>;
}) {
    const { collectionName } = await params;
    const collectionResult = await getCollection(collectionName);

    if (
        !collectionResult ||
        !collectionResult.success ||
        !collectionResult.data
    ) {
        return (
            <div className="container mx-auto flex flex-col gap-y-8 p-8">
                <Alert variant="destructive">
                    <Terminal className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>
                        {collectionResult?.error ||
                            `Collection '${collectionName}' not found.`}
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    const collection = collectionResult.data;

    return (
        <>
            <CollectionNavigation collectionName={collection.name} />
            <div className="container mx-auto px-4 py-8 space-y-8">
                <CollectionHeader
                    name={collection.name}
                    numDocuments={collection.num_documents}
                    fieldsCount={collection.fields?.length || 0}
                    createdAt={collection.created_at}
                />
                <BulkOperations collectionName={collectionName} />
            </div>
        </>
    );
}