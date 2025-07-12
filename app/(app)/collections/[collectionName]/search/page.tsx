import React from 'react';

import TypesenseSearch from '@/components/features/search/TypesenseSearch';

export default async function page({
    params,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
    params: Promise<{ collectionName: string }>;
}) {
    const { collectionName } = await params;

    return <TypesenseSearch collectionName={collectionName} />;
}
