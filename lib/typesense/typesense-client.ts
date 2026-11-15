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

        const envConfig = getConnectionConfigFromEnv();
        const config = envConfig || getDefaultConnectionConfig();
        
        typesenseClient = createTypesenseClient(config);
    }
    
    return typesenseClient;
}


export function resetTypesenseClient() {
    typesenseClient = null;
}


export default getTypesenseClient();
