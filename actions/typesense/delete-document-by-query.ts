"use server";
export const deleteDocumentsByQuery = async ({
  typesenseHost,
  typesensePort,
  typesenseProtocol,
  typesenseApiKey,
  collectionName,
  filterBy,
  batchSize,
}: {
  typesenseHost: string;
  typesensePort: number;
  typesenseProtocol: string;
  typesenseApiKey: string;
  collectionName: string;
  filterBy: string;
  batchSize: number;
}) => {
  const url = `${typesenseProtocol}://${typesenseHost}:${typesensePort}/collections/${collectionName}/documents?filter_by=${filterBy}&batch_size=${batchSize}`;

  const response = await fetch(url, {
    method: "DELETE",
    headers: {
      "X-TYPESENSE-API-KEY": typesenseApiKey,
    },
  });

  const data = await response.json();
  return data;
};
