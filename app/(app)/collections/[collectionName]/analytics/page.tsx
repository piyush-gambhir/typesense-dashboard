import React from 'react';

import CollectionAnalytics from '@/components/features/collections/CollectionAnalytics';

export default async function AnalyticsPage({
    params,
}: {
    params: Promise<{ collectionName: string }>;
}) {
    const { collectionName } = await params;
    return <CollectionAnalytics collectionName={collectionName} />;
}