import { getCollections } from '@/lib/typesense/collections';
import { getTypesenseMetrics } from '@/lib/typesense/get-cluster-metrics';

export async function getClusterHealth(connectionParams?: {
    typesenseHost?: string;
    typesensePort?: number;
    typesenseProtocol?: string;
    typesenseApiKey?: string;
}) {
    try {
        const metrics = await getTypesenseMetrics({
            typesenseHost:
                connectionParams?.typesenseHost ??
                process.env.TYPESENSE_HOST ??
                'localhost',
            typesensePort:
                connectionParams?.typesensePort ??
                parseInt(process.env.TYPESENSE_PORT || '8108'),
            typesenseProtocol:
                connectionParams?.typesenseProtocol ??
                process.env.TYPESENSE_PROTOCOL ??
                'http',
            typesenseApiKey:
                connectionParams?.typesenseApiKey ??
                process.env.TYPESENSE_API_KEY ??
                'xyz',
        });

        const collections = await getCollections();

        return {
            status: 'healthy',
            metrics: metrics,
            collections: collections.success ? collections.data : [],
            timestamp: new Date().toISOString(),
        };
    } catch (error) {
        console.error('Error getting cluster health:', error);
        return {
            status: 'error',
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString(),
        };
    }
}
