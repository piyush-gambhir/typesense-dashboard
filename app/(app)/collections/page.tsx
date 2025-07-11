import React from 'react';

import { getCollections } from '@/lib/typesense/collections';

import TypesenseCollections from '@/components/collections/TypesenseCollections';
import CreateCollectionDialog from '@/components/CreateCollectionDialog';

export default async function page() {
  const collections = await getCollections();

  return (
    <div className="container mx-auto flex flex-col gap-y-8">
      <div className="flex justify-end p-8">
        <CreateCollectionDialog />
      </div>
      <TypesenseCollections collections={collections ?? []} />
    </div>
  );
}
