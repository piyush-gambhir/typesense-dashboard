import { getCollections as getTypesenseCollections } from '@/lib/typesense/collections';
import { getTypesenseMetrics as getMetrics } from '@/lib/typesense/get-cluster-metrics';

export async function getClusterHealth(
    connectionParams?: {
        typesenseHost: string;
        typesensePort: number;
        typesenseProtocol: string;
        typesenseApiKey: string;
    }
) {
    try {
        const params = connectionParams || {
            typesenseHost: process.env.TYPESENSE_HOST ?? 'localhost',
            typesensePort: parseInt(process.env.TYPESENSE_PORT ?? '8108'),
            typesenseProtocol: process.env.TYPESENSE_PROTOCOL ?? 'http',
            typesenseApiKey: process.env.TYPESENSE_API_KEY ?? '',
        };

        const metrics = await getMetrics(params);
        const collections = await getTypesenseCollections();

        return {
            ok: true,
            metrics,
            collections,
        };
    } catch (error) {
        console.error('Error fetching cluster health:', error);
        return {
            ok: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}
