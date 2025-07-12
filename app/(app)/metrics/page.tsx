import { getClusterHealth } from '@/actions/typesense/get-cluster-health';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

import TypesenseServerMetrics from '@/components/TypesenseServerMetrics';

export default async function page() {
  const clusterData = await getClusterHealth();

  if (!clusterData) {
    return (
      <div className="container mx-auto p-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Connection Error</AlertTitle>
          <AlertDescription>
            Unable to connect to Typesense server. Please check your configuration and try again.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <TypesenseServerMetrics
      metrics={clusterData?.metrics}
      collections={clusterData?.collections}
    />
  );
}
