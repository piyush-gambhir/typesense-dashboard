import React from 'react';

import DocumentValidator from '@/components/features/documents/DocumentValidator';

export default async function DocumentValidatorPage({
    params,
}: {
    params: Promise<{ collectionName: string }>;
}) {
    const { collectionName } = await params;
    return <DocumentValidator collectionName={collectionName} />;
}
