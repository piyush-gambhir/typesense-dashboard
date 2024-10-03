'use server';

export const getClusterHealth = async ({
  typesenseHost,
  typesensePort,
  typesenseProtocol,
}: {
  typesenseHost: string;
  typesensePort: number;
  typesenseProtocol: string;
}) => {
  try {
    const url = `${typesenseProtocol}://${typesenseHost}:${typesensePort}/health`;
    const response = await fetch(url);

    if (!response.ok) {
      // Check if the response was unsuccessful
      throw new Error(
        `Failed to connect to Typesense server at ${url}: ${response.statusText}`,
      );
    }

    await response.json();

    return { ok: true };
  } catch (error) {
    console.error(`Error connecting to Typesense server: ${error}`);
    return { ok: false, error: String(error) };
  }
};
