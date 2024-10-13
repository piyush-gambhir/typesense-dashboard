import React from 'react';

import ExportDocuments from '@/components/documents/ExportDocuments';

export default function page({
  params,
}: {
  params: { collectionName: string };
}) {
  return <ExportDocuments collectionName={params.collectionName} />;
}
