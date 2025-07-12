import React from 'react';

import { listApiKeys } from '@/lib/typesense/api-keys';

import TypesenseApiSettings from '@/components/features/settings/TypesenseApiSettings';

export default async function page() {
    const apiKeysResponse = await listApiKeys();

    // Convert the response to the expected format
    const apiKeys = (apiKeysResponse?.keys || []).map((key) => ({
        id: key.id,
        description: key.description || '',
        actions: key.actions,
        collections: key.collections,
        value: key.value,
    }));

    return <TypesenseApiSettings initialApiKeys={apiKeys} />;
}
