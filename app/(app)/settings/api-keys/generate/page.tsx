import React from 'react';

import { listApiKeys } from '@/lib/typesense/api-keys';

import TypesenseApiSettings from '@/components/TypesenseApiSettings';

export default async function page() {
  const apiKeys = await listApiKeys();
  return <TypesenseApiSettings initialApiKeys={apiKeys ?? []} />;
}
