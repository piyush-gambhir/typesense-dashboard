import React from 'react';

import DocumentSuggestions from '@/components/features/documents/DocumentSuggestions';

export default async function DocumentSuggestionsPage({
    params,
}: {
    params: Promise<{ collectionName: string }>;
}) {
    const { collectionName } = await params;
    return <DocumentSuggestions collectionName={collectionName} />;
}
