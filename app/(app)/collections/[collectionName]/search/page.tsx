import React from 'react';

import NLSearchWrapper from '@/components/features/search/NLSearchWrapper';

export default async function page({
  params,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
  params: Promise<{ collectionName: string }>;
}) {
  const { collectionName } = await params;

  return (
    <NLSearchWrapper
      collectionName={collectionName}
    />
  );
}
