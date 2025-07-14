import { Terminal } from 'lucide-react';
import React from 'react';

import { getCollection } from '@/lib/typesense/collections';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

import CollectionNavigation from '@/components/features/collections/collection-details/collection-navigation';
import DocumentSuggestions from '@/components/features/documents/document-suggestions';

export default async function DocumentSuggestionsPage({
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
            <Alert variant="destructive">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                    {collectionResult?.error ||
                        `Collection '${collectionName}' not found.`}
                </AlertDescription>
            </Alert>
        );
    }

    const collection = collectionResult.data;

    return (
        <>
            <CollectionNavigation collectionName={collection.name} />
            <DocumentSuggestions collectionName={collectionName} />
        </>
    );
}
