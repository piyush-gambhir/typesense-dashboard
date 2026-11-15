


'use server';
import { cookies } from 'next/headers';
import { TypesenseConnectionConfig, getConnectionConfigFromEnv, getDefaultConnectionConfig } from '@/lib/connection-config';
import { createTypesenseClient } from '@/lib/typesense/typesense-client';

const COOKIE_NAME = 'typesense-connection-config';

export async function getServerConnectionConfig(): Promise<TypesenseConnectionConfig> {

    const envConfig = getConnectionConfigFromEnv();
    if (envConfig) {
        return envConfig;
    }


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


    return getDefaultConnectionConfig();
}

export async function getServerTypesenseClient() {
    const config = await getServerConnectionConfig();
    return createTypesenseClient(config);
}