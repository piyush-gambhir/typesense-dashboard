import React from 'react';

import ImportDocuments from '@/components/documents/ImportDocuments';

export default function page({
  params: { collectionName },
}: {
  params: { collectionName: string };
}) {
  return <ImportDocuments collectionName={collectionName} />;
}
