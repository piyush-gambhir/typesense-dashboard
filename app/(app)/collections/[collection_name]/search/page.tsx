import React from 'react';

import TypesenseSearch from '@/components/TypesenseSearch';

export default function page({
  searchParams,
  params,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
  params: { collection_name: string };
}) {
  const { collection_name } = params;

  return (
    <TypesenseSearch
      collectionName={collection_name}
      searchParams={searchParams}
    />
  );
}
