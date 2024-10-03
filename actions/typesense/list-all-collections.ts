'use server';
export const listAllCollections = async ({
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
  const url = `${typesenseProtocol}://${typesenseHost}:${typesensePort}/collections`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-TYPESENSE-API-KEY': typesenseApiKey,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching collections:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'An unknown error occurred',
    };
  }
};
