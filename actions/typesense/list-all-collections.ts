"use server";
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

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "X-TYPESENSE-API-KEY": typesenseApiKey,
    },
  });

  const data = await response.json();
  return data;
};
