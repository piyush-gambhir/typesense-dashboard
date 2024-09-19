"use server";
export const retrieveDocument = async ({
  typesenseHost,
  typesensePort,
  typesenseProtocol,
  typesenseApiKey,
  collectionName,
  documentId,
}: {
  typesenseHost: string;
  typesensePort: number;
  typesenseProtocol: string;
  typesenseApiKey: string;
  collectionName: string;
  documentId: string;
}) => {
  const url = `${typesenseProtocol}://${typesenseHost}:${typesensePort}/collections/${collectionName}/documents/${documentId}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "X-TYPESENSE-API-KEY": typesenseApiKey,
    },
  });

  const data = await response.json();
  return data;
};
