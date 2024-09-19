"use server";
export const createCollection = async ({
  typesenseHost,
  typesensePort,
  typesenseProtocol,
  typesenseApiKey,
  collectionName,
  fields,
  defaultSortingField,
}: {
  typesenseHost: string;
  typesensePort: number;
  typesenseProtocol: string;
  typesenseApiKey: string;
  collectionName: string;
  fields: Array<{ name: string; type: string; facet?: boolean }>;
  defaultSortingField: string;
}) => {
  const url = `${typesenseProtocol}://${typesenseHost}:${typesensePort}/collections`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-TYPESENSE-API-KEY": typesenseApiKey,
    },
    body: JSON.stringify({
      name: collectionName,
      fields,
      default_sorting_field: defaultSortingField,
    }),
  });

  const data = await response.json();
  return data;
};
