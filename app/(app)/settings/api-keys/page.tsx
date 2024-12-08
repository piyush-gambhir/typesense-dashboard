import React from 'react';

import { getApiKeys } from '@/lib/typesense/api-keys';

import TypesenseApiSettings from '@/components/TypesenseApiSettings';

export default async function page() {
  const apiKeys = await getApiKeys();
  return <TypesenseApiSettings initialApiKeys={apiKeys ?? []} />;
}
