import React from 'react';

import { getCollections } from '@/lib/typesense/actions/collections';

import TypesenseCollections from '@/components/collections/TypesenseCollections';

export default async function page() {
  const collections = await getCollections();

  return <TypesenseCollections collections={collections ?? []} />;
}
