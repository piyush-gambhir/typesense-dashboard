import { Client } from 'typesense';
import { TypesenseConnectionConfig, getConnectionConfigFromEnv, getDefaultConnectionConfig } from '@/lib/connection-config';

let typesenseClient: Client | null = null;

export function createTypesenseClient(config: TypesenseConnectionConfig): Client {
    return new Client({
        nodes: [
            {
                host: config.host,
                port: config.port,
                protocol: config.protocol,
            },
        ],
        apiKey: config.apiKey,
        connectionTimeoutSeconds: 10,
    });
}

export function getTypesenseClient(): Client {
    if (!typesenseClient) {
        // Try environment variables first
        const envConfig = getConnectionConfigFromEnv();
        const config = envConfig || getDefaultConnectionConfig();
        
        typesenseClient = createTypesenseClient(config);
    }
    
    return typesenseClient;
}

// Reset client instance (useful for when connection config changes)
export function resetTypesenseClient() {
    typesenseClient = null;
}

// Default export for backwards compatibility
export default getTypesenseClient();
