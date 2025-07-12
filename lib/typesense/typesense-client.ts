import { Client } from 'typesense';

const typesenseClient = new Client({
    nodes: [
        {
            host: process.env.TYPESENSE_HOST ?? 'localhost',
            port: parseInt(process.env.TYPESENSE_PORT ?? '8108'),
            protocol: process.env.TYPESENSE_PROTOCOL ?? 'http',
        },
    ],
    apiKey: process.env.TYPESENSE_API_KEY ?? 'xyz',
    connectionTimeoutSeconds: 10, // Reduced timeout for faster failure detection
});

export default typesenseClient;
