import React from 'react';

import CollectionDocumentsManager from '@/components/features/collections/collection-documents-manager';

export default async function DocumentsPage({
    params,
}: {
    params: Promise<{ collectionName: string }>;
}) {
    const { collectionName } = await params;
    return <CollectionDocumentsManager collectionName={collectionName} />;
}
