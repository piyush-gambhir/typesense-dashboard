import React from 'react';

import { getCollection } from '@/lib/typesense/collections';

import TypesenseCollectionDetails from '@/components/collections/TypesenseCollectionDetails';

export default async function page({
  params,
}: {
  params: { collectionName: string };
}) {
  const collection = await getCollection(params.collectionName);
  if (!collection) {
    throw new Error('Collection not found');
  }
  return <TypesenseCollectionDetails initialCollection={collection} />;
}
