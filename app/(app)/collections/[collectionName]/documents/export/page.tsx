import React from 'react';

import ExportDocuments from '@/components/features/documents/ExportDocuments';

export default async function page({
    params,
}: {
    params: Promise<{ collectionName: string }>;
}) {
    const { collectionName } = await params;
    return <ExportDocuments collectionName={collectionName} />;
}
