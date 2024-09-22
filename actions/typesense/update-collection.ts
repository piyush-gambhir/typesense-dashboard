"use server";
export const updateCollection = async ({
  typesenseHost,
  typesensePort,
  typesenseProtocol,
  typesenseApiKey,
  collectionName,
  fields,
}: {
  typesenseHost: string;
  typesensePort: number;
  typesenseProtocol: string;
  typesenseApiKey: string;
  collectionName: string;
  fields: Array<{ name: string; drop?: boolean; type?: string }>;
}) => {
  const url = `${typesenseProtocol}://${typesenseHost}:${typesensePort}/collections/${collectionName}`;

  const response = await fetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "X-TYPESENSE-API-KEY": typesenseApiKey,
    },
    body: JSON.stringify({
      fields,
    }),
  });

  const data = await response.json();
  return data;
};
