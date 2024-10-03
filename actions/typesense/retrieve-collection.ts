'use server';
export const retrieveCollection = async ({
  typesenseHost,
  typesensePort,
  typesenseProtocol,
  typesenseApiKey,
  collectionName,
}: {
  typesenseHost: string;
  typesensePort: number;
  typesenseProtocol: string;
  typesenseApiKey: string;
  collectionName: string;
}) => {
  const url = `${typesenseProtocol}://${typesenseHost}:${typesensePort}/collections/${collectionName}`;

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
    return data;
  } catch (error) {
    console.error('Error retrieving collection:', error);
    throw error; // Re-throw the error for the caller to handle
  }
};
