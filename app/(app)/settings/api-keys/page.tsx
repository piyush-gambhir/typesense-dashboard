import { AlertCircle } from 'lucide-react';
import React from 'react';

import { listApiKeys } from '@/lib/typesense/api-keys';
import { checkTypesenseConnection } from '@/lib/typesense/connection-check';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

import TypesenseApiSettings from '@/components/features/settings/TypesenseApiSettings';

export default async function page() {
    // Check connection first
    const connectionStatus = await checkTypesenseConnection();

    if (!connectionStatus.isConnected) {
        return (
            <div className="container mx-auto p-4">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Connection Error</AlertTitle>
                    <AlertDescription>
                        Unable to connect to Typesense server. Please check your
                        configuration and try again. Error:{' '}
                        {connectionStatus.error}
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    try {
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
    } catch (error) {
        return (
            <div className="container mx-auto p-4">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error Loading API Keys</AlertTitle>
                    <AlertDescription>
                        Failed to load API keys. Please try again later.
                    </AlertDescription>
                </Alert>
            </div>
        );
    }
}
