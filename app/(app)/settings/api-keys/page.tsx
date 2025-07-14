import { AlertCircle, Key, Shield } from 'lucide-react';
import React from 'react';

import { listApiKeys } from '@/lib/typesense/api-keys';
import { checkTypesenseConnection } from '@/lib/typesense/connection-check';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

import TypesenseApiSettings from '@/components/features/settings/typesense-api-settings';

export default async function page() {
    // Check connection first
    const connectionStatus = await checkTypesenseConnection();

    if (!connectionStatus.isConnected) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="space-y-8">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="space-y-2">
                            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                                <div className="relative">
                                    <Key className="h-8 w-8 text-primary" />
                                    <div className="absolute -bottom-1 -right-1">
                                        <div className="w-4 h-4 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center">
                                            <AlertCircle className="h-2 w-2 text-white" />
                                        </div>
                                    </div>
                                </div>
                                API Keys
                            </h1>
                            <p className="text-muted-foreground">
                                Manage your Typesense API keys and access permissions
                            </p>
                        </div>
                    </div>

                    {/* Connection Error */}
                    <div className="max-w-2xl mx-auto">
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
                </div>
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

        return (
            <div className="container mx-auto px-4 py-8 space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                            <div className="relative">
                                <Key className="h-8 w-8 text-primary" />
                                <div className="absolute -bottom-1 -right-1">
                                    <div className="w-4 h-4 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center">
                                        <Shield className="h-2 w-2 text-white" />
                                    </div>
                                </div>
                            </div>
                            API Keys
                        </h1>
                        <p className="text-muted-foreground">
                            Manage your Typesense API keys and access permissions
                        </p>
                    </div>
                </div>

                {/* API Settings */}
                <TypesenseApiSettings initialApiKeys={apiKeys} />
            </div>
        );
    } catch (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="space-y-8">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="space-y-2">
                            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                                <div className="relative">
                                    <Key className="h-8 w-8 text-primary" />
                                    <div className="absolute -bottom-1 -right-1">
                                        <div className="w-4 h-4 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center">
                                            <AlertCircle className="h-2 w-2 text-white" />
                                        </div>
                                    </div>
                                </div>
                                API Keys
                            </h1>
                            <p className="text-muted-foreground">
                                Manage your Typesense API keys and access permissions
                            </p>
                        </div>
                    </div>

                    {/* Error State */}
                    <div className="max-w-2xl mx-auto">
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Error Loading API Keys</AlertTitle>
                            <AlertDescription>
                                Failed to load API keys. Please try again later.
                            </AlertDescription>
                        </Alert>
                    </div>
                </div>
            </div>
        );
    }
}