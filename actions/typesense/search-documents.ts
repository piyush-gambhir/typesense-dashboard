"use server";
export const searchDocuments = async ({
  typesenseHost,
  typesensePort,
  typesenseProtocol,
  typesenseApiKey,
  collectionName,
  query,
  queryBy,
  filterBy,
  sortBy,
}: {
  typesenseHost: string;
  typesensePort: number;
  typesenseProtocol: string;
  typesenseApiKey: string;
  collectionName: string;
  query: string;
  queryBy: string;
  filterBy?: string;
  sortBy?: string;
}) => {
  const url = `${typesenseProtocol}://${typesenseHost}:${typesensePort}/collections/${collectionName}/documents/search?q=${query}&query_by=${queryBy}${filterBy ? `&filter_by=${filterBy}` : ""}${sortBy ? `&sort_by=${sortBy}` : ""}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "X-TYPESENSE-API-KEY": typesenseApiKey,
    },
  });

  const data = await response.json();
  return data;
};
