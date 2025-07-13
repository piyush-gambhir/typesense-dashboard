import { AlertCircle } from 'lucide-react';

import { getClusterHealth } from '@/lib/typesense/cluster-health';
import { checkTypesenseConnection } from '@/lib/typesense/connection-check';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

import TypesenseServerMetrics from '@/components/features/analytics/typesense-server-metrics';

export default async function page() {
    // Check connection first
    const connectionStatus = await checkTypesenseConnection();

    if (!connectionStatus.isConnected) {
        return (
            <div className="container mx-auto px-4 py-8">
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
        );
    }

    try {
        const clusterData = await getClusterHealth();

        if (!clusterData || clusterData.status === 'error') {
            return (
                <div className="container mx-auto px-4 py-8">
                    <div className="max-w-2xl mx-auto">
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Connection Error</AlertTitle>
                            <AlertDescription>
                                Unable to connect to Typesense server. Please check
                                your configuration and try again.
                            </AlertDescription>
                        </Alert>
                    </div>
                </div>
            );
        }

        return (
            <TypesenseServerMetrics
                metrics={clusterData?.metrics}
                collections={{
                    success: true,
                    data: (clusterData?.collections || []).map((col) => ({
                        ...col,
                        default_sorting_field: col.default_sorting_field ?? '',
                        enable_nested_fields: col.enable_nested_fields ?? false,
                        symbols_to_index: col.symbols_to_index ?? [],
                        token_separators: col.token_separators ?? [],
                    })),
                }}
            />
        );
    } catch (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-2xl mx-auto">
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error Loading Metrics</AlertTitle>
                        <AlertDescription>
                            Failed to load server metrics. Please try again later.
                        </AlertDescription>
                    </Alert>
                </div>
            </div>
        );
    }
}
