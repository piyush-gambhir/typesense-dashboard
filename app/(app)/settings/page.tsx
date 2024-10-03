import React from 'react';

import { getApiKeys } from '@/lib/typesense/actions/api-keys';

import TypesenseApiSettings from '@/components/TypesenseApiSettings';

export default async function page() {
  const apiKeys = await getApiKeys();
  console.log(apiKeys)
  return <TypesenseApiSettings initialApiKeys={apiKeys ?? []} />;
}
