import React from 'react';

import { getCollections } from '@/lib/typesense/collections';

import TypesenseCollections from '@/components/collections/TypesenseCollections';
import CreateCollectionDialog from '@/components/CreateCollectionDialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';

export default async function page() {
  const collectionsResult = await getCollections();

  if (!collectionsResult || !collectionsResult.success) {
    return (
      <div className="container mx-auto flex flex-col gap-y-8 p-8">
        <Alert variant="destructive">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {collectionsResult?.error || 'Failed to load collections. Please check your Typesense connection.'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto flex flex-col gap-y-8">
      <div className="flex justify-end p-8">
        <CreateCollectionDialog />
      </div>
      <TypesenseCollections collections={collectionsResult.data || []} />
    </div>
  );
}
