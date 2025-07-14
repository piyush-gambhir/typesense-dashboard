import { Terminal } from 'lucide-react';
import React from 'react';

import { getCollection } from '@/lib/typesense/collections';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

import CollectionHeader from '@/components/features/collections/collection-details/collection-header';
import CollectionNavigation from '@/components/features/collections/collection-details/collection-navigation';
import EditDocumentPage from '@/components/features/documents/edit-document';

export default async function page({
    params,
}: {
    params: Promise<{ collectionName: string; documentId: string }>;
}) {
    const { collectionName, documentId } = await params;
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

            <EditDocumentPage
                collectionName={collectionName}
                documentId={documentId}
            />
        </>
    );
}
