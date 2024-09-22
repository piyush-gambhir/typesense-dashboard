"use server";
export const updateDocument = async ({
  typesenseHost,
  typesensePort,
  typesenseProtocol,
  typesenseApiKey,
  collectionName,
  documentId,
  documentData,
}: {
  typesenseHost: string;
  typesensePort: number;
  typesenseProtocol: string;
  typesenseApiKey: string;
  collectionName: string;
  documentId: string;
  documentData: Record<string, any>;
}) => {
  const url = `${typesenseProtocol}://${typesenseHost}:${typesensePort}/collections/${collectionName}/documents/${documentId}`;

  const response = await fetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "X-TYPESENSE-API-KEY": typesenseApiKey,
    },
    body: JSON.stringify(documentData),
  });

  const data = await response.json();
  return data;
};
