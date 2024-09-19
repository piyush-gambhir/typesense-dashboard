"use server";
export const indexDocument = async ({
  typesenseHost,
  typesensePort,
  typesenseProtocol,
  typesenseApiKey,
  collectionName,
  document,
}: {
  typesenseHost: string;
  typesensePort: number;
  typesenseProtocol: string;
  typesenseApiKey: string;
  collectionName: string;
  document: Record<string, any>;
}) => {
  const url = `${typesenseProtocol}://${typesenseHost}:${typesensePort}/collections/${collectionName}/documents`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-TYPESENSE-API-KEY": typesenseApiKey,
    },
    body: JSON.stringify(document),
  });

  const data = await response.json();
  return data;
};
