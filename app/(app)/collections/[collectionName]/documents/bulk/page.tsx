import React from 'react';

import BulkOperations from '@/components/features/documents/BulkOperations';

export default async function BulkOperationsPage({
    params,
}: {
    params: Promise<{ collectionName: string }>;
}) {
    const { collectionName } = await params;
    return <BulkOperations collectionName={collectionName} />;
}
