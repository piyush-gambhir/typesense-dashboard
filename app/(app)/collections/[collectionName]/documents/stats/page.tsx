import React from 'react';

import DocumentStats from '@/components/features/documents/DocumentStats';

export default async function DocumentStatsPage({
    params,
}: {
    params: Promise<{ collectionName: string }>;
}) {
    const { collectionName } = await params;
    return <DocumentStats collectionName={collectionName} />;
}
