import { getCollections } from '@/lib/typesense/collections';
import { getTypesenseMetrics } from '@/lib/typesense/get-cluster-metrics';

import TypesenseServerMetrics from '@/components/TypesenseServerMetrics';

export default async function page() {
  const metrics = await getTypesenseMetrics({
    typesenseHost: process.env.TYPESENSE_HOST ?? 'localhost',
    typesensePort: parseInt(process.env.TYPESENSE_PORT ?? '8108'),
    typesenseProtocol: process.env.TYPESENSE_PROTOCOL ?? 'http',
    typesenseApiKey: process.env.TYPESENSE_API_KEY ?? '',
  });

  const collections = await getCollections();
  console.log(collections);
  return (
    <TypesenseServerMetrics metrics={metrics} collections={collections} />
  );
}
