import typesenseClient from './typesense-client';

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
    const serverInfo = {
        host: process.env.TYPESENSE_HOST ?? 'localhost',
        port: parseInt(process.env.TYPESENSE_PORT ?? '8108'),
        protocol: process.env.TYPESENSE_PROTOCOL ?? 'http',
    };

    // Check if required environment variables are set
    const requiredVars = [
        'TYPESENSE_HOST',
        'TYPESENSE_PORT',
        'TYPESENSE_PROTOCOL',
        'TYPESENSE_API_KEY',
    ];
    const missingVars = requiredVars.filter((varName) => !process.env[varName]);

    if (missingVars.length > 0) {
        return {
            isConnected: false,
            error: `Missing environment variables: ${missingVars.join(', ')}`,
            serverInfo,
            timestamp: new Date().toISOString(),
        };
    }

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
