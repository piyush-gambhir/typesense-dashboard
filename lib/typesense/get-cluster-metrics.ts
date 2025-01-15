export async function getTypesenseMetrics({
  typesenseHost,
  typesensePort,
  typesenseProtocol,
  typesenseApiKey,
}: {
  typesenseHost: string;
  typesensePort: number;
  typesenseProtocol: string;
  typesenseApiKey: string;
}) {
  try {
    const response = await fetch(
      `${typesenseProtocol}://${typesenseHost}:${typesensePort}/metrics.json`,
      {
        cache: 'no-cache',
        headers: {
          'X-TYPESENSE-API-KEY': typesenseApiKey,
        },
      },
    );

    const metrics = response.json();
    return metrics;
  } catch (error) {
    console.error('Error fetching metrics:', error);
  }
}
