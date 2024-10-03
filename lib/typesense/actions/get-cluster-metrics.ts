export async function getTypesenseMetrics({
  apiKey,
  host,
}: {
  apiKey: string;
  host: string;
}) {
  try {
    const response = await fetch(`${host}/metrics.json`, {
      cache: "no-cache",
      headers: {
        "X-TYPESENSE-API-KEY": apiKey,
      },
    });

    const metrics = response.json();
    return metrics;
  } catch (error) {
    console.error("Error fetching metrics:", error);
  }
}
