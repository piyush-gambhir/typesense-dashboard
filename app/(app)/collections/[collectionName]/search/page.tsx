import React from 'react';

import TypesenseSearch from '@/components/TypesenseSearch';

export default function page({
  searchParams,
  params,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
  params: { collectionName: string };
}) {
  const { collectionName } = params;

  return (
    <TypesenseSearch
      collectionName={collectionName}
      searchParams={searchParams}
    />
  );
}
