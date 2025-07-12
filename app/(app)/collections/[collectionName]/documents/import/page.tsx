import React from 'react';

import ImportDocuments from '@/components/features/documents/ImportDocuments';

export default async function page({
  params,
}: {
  params: Promise<{ collectionName: string }>;
}) {
  const { collectionName } = await params;
  return <ImportDocuments collectionName={collectionName} />;
}
