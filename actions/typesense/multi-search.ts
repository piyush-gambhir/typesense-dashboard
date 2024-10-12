"use server";
export const multiSearchDocuments = async ({
  typesenseHost,
  typesensePort,
  typesenseProtocol,
  typesenseApiKey,
  searches,
}: {
  typesenseHost: string;
  typesensePort: number;
  typesenseProtocol: string;
  typesenseApiKey: string;
  searches: Array<{
    collection: string;
    q: string;
    filterBy?: string;
  }>;
}) => {
  const url = `${typesenseProtocol}://${typesenseHost}:${typesensePort}/multi_search`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-TYPESENSE-API-KEY": typesenseApiKey,
    },
    body: JSON.stringify({ searches }),
  });

  const data = await response.json();
  return data;
};
