import React from 'react';

import { getCollection } from '@/lib/typesense/actions/collections';

import TypesenseCollectionDetails from '@/components/TypesenseCollectionDetails';

export default async function page({
  params,
}: {
  params: { collection_name: string };
}) {
  const collection = await getCollection(params.collection_name);
  return <TypesenseCollectionDetails initialCollection={collection} />;
}
