import React from 'react';

import ExportDocuments from '@/components/documents/ExportDocuments';

export default function page({
  params,
}: {
  params: { collection_name: string };
}) {
  return <ExportDocuments collectionName={params.collection_name} />;
}
