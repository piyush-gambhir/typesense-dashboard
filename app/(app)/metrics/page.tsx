import { AlertCircle } from 'lucide-react';

import { getClusterHealth } from '@/lib/typesense/cluster-health';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

import TypesenseServerMetrics from '@/components/features/analytics/TypesenseServerMetrics';

export default async function page() {
    const clusterData = await getClusterHealth();

    if (!clusterData) {
        return (
            <div className="container mx-auto p-4">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Connection Error</AlertTitle>
                    <AlertDescription>
                        Unable to connect to Typesense server. Please check your
                        configuration and try again.
                    </AlertDescription>
                </Alert>
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
}
