"use server";
export const exportDocuments = async ({
  typesenseHost,
  typesensePort,
  typesenseProtocol,
  typesenseApiKey,
  collectionName,
  includeFields,
  excludeFields,
}: {
  typesenseHost: string;
  typesensePort: number;
  typesenseProtocol: string;
  typesenseApiKey: string;
  collectionName: string;
  includeFields?: string;
  excludeFields?: string;
}) => {
  const url = `${typesenseProtocol}://${typesenseHost}:${typesensePort}/collections/${collectionName}/documents/export?${includeFields ? `include_fields=${includeFields}` : ""}${excludeFields ? `&exclude_fields=${excludeFields}` : ""}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "X-TYPESENSE-API-KEY": typesenseApiKey,
    },
  });

  const data = await response.json();
  return data;
};
