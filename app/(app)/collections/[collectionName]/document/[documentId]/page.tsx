import React from 'react';

import EditDocumentPage from '@/components/features/documents/EditDocument';

export default async function page({
  params,
}: {
  params: Promise<{ collectionName: string; documentId: string }>;
}) {
  const { collectionName, documentId } = await params;

  return (
    <EditDocumentPage collectionName={collectionName} documentId={documentId} />
  );
}
