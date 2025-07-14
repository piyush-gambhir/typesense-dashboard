import { getServerTypesenseClient, getServerConnectionConfig } from '@/lib/typesense/get-server-client';

export interface ConnectionStatus {
    isConnected: boolean;
    error?: string;
    serverInfo?: {
        host: string;
        port: number;
        protocol: string;
    };
    timestamp: string;
}

export async function checkTypesenseConnection(): Promise<ConnectionStatus> {
    // Get the actual configuration that will be used
    const config = await getServerConnectionConfig();
    const typesenseClient = await getServerTypesenseClient();
    
    const serverInfo = {
        host: config.host,
        port: config.port,
        protocol: config.protocol,
    };

    try {
        // Create a timeout promise to avoid hanging during build
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Connection timeout')), 5000); // 5 second timeout
        });

        // Try to fetch collections as a simple connectivity test
        const connectionPromise = typesenseClient.collections().retrieve();

        await Promise.race([connectionPromise, timeoutPromise]);

        return {
            isConnected: true,
            serverInfo,
            timestamp: new Date().toISOString(),
        };
    } catch (error) {
        console.error('Typesense connection check failed:', error);

        let errorMessage = 'Unknown connection error';

        if (error instanceof Error) {
            // Handle specific error types
            if (error.message.includes('ECONNREFUSED')) {
                errorMessage = 'Connection refused - server may not be running';
            } else if (error.message.includes('ENOTFOUND')) {
                errorMessage =
                    'Host not found - check your TYPESENSE_HOST configuration';
            } else if (
                error.message.includes('timeout') ||
                error.message.includes('Connection timeout')
            ) {
                errorMessage =
                    'Connection timeout - server may be overloaded or network issues';
            } else if (error.message.includes('401')) {
                errorMessage = 'Authentication failed - check your API key';
            } else if (error.message.includes('403')) {
                errorMessage = 'Access forbidden - check API key permissions';
            } else {
                errorMessage = error.message;
            }
        }

        return {
            isConnected: false,
            error: errorMessage,
            serverInfo,
            timestamp: new Date().toISOString(),
        };
    }
}

export async function isTypesenseAvailable(): Promise<boolean> {
    try {
        const status = await checkTypesenseConnection();
        return status.isConnected;
    } catch {
        return false;
    }
}
