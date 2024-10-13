import React from 'react';

import EditDocumentPage from '@/components/EditDocument';

export default function page({
  params,
}: {
  params: { collectionName: string; documentId: string };
}) {
  const collectionName = params.collectionName;
  const documentId = params.documentId;

  return (
    <EditDocumentPage collectionName={collectionName} documentId={documentId} />
  );
}
