'use server';

export const getClusterMetrics = async ({
  typesenseHost,
  typesensePort,
  typesenseProtocol,
  typesenseApiKey,
}: {
  typesenseHost: string;
  typesensePort: number;
  typesenseProtocol: string;
  typesenseApiKey: string;
}) => {
  try {
    const url = `${typesenseProtocol}://${typesenseHost}:${typesensePort}/metrics.json`;
    const response = await fetch(url, {
      headers: {
        'X-TYPESENSE-API-KEY': typesenseApiKey,
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch cluster metrics from Typesense server at ${url}: ${response.statusText}`,
      );
    }

    const data = await response.json();
    return { ok: true, data };
  } catch (error) {
    console.error(
      `Error fetching cluster metrics from Typesense server: ${error}`,
    );
    return { ok: false, error: String(error) };
  }
};
