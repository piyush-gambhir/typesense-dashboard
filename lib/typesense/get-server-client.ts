// Mark this module as server-only so that it is never bundled into the client
// bundle. This allows us to safely use `next/headers`, which can only be
// imported in a Server Component or on the server runtime.
'use server';
import { cookies } from 'next/headers';
import { TypesenseConnectionConfig, getConnectionConfigFromEnv, getDefaultConnectionConfig } from '@/lib/connection-config';
import { createTypesenseClient } from '@/lib/typesense/typesense-client';

const COOKIE_NAME = 'typesense-connection-config';

export async function getServerConnectionConfig(): Promise<TypesenseConnectionConfig> {
    // First, check environment variables
    const envConfig = getConnectionConfigFromEnv();
    if (envConfig) {
        return envConfig;
    }

    // Otherwise, check cookies
    const cookieStore = await cookies();
    const configCookie = cookieStore.get(COOKIE_NAME);
    
    if (configCookie) {
        try {
            const parsedConfig = JSON.parse(configCookie.value) as TypesenseConnectionConfig;
            return parsedConfig;
        } catch (error) {
            console.error('Failed to parse connection config from cookie:', error);
        }
    }

    // Return defaults if nothing is found
    return getDefaultConnectionConfig();
}

export async function getServerTypesenseClient() {
    const config = await getServerConnectionConfig();
    return createTypesenseClient(config);
}