import React from 'react';

import { getCollections } from '@/lib/typesense/collections';

import TypesenseCollections from '@/components/features/collections/TypesenseCollections';

export default async function page() {
  const collectionsResult = await getCollections();

  return (
    <TypesenseCollections collections={collectionsResult.data || []} />
  );
}
