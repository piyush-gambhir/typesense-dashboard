import TypesenseServerMetrics from "@/components/TypesenseServerMetrics";

import { getTypesenseMetrics } from "@/lib/typesense/actions/get-cluster-metrics";

export default async function page() {
  const metrics = await getTypesenseMetrics({
    host: "http://localhost:8108",
    apiKey: "xyz",
  });

  return <TypesenseServerMetrics metrics={metrics} />;
}
