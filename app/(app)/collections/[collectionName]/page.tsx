import React from 'react';

import { getCollection } from '@/lib/typesense/collections';

import TypesenseCollectionDetails from '@/components/features/collections/TypesenseCollectionDetails';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';

export default async function page({
  params,
}: {
  params: Promise<{ collectionName: string }>;
}) {
  const { collectionName } = await params;
  const collectionResult = await getCollection(collectionName);

  if (!collectionResult || !collectionResult.success) {
    return (
      <div className="container mx-auto flex flex-col gap-y-8 p-8">
        <Alert variant="destructive">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {collectionResult?.error || `Collection '${collectionName}' not found.`}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return <TypesenseCollectionDetails initialCollection={collectionResult.data} />;
}
