"use server";
export const getClusterHealth = async ({
  typesenseHost,
  typesensePort,
  typesenseProtocol,
}: {
  typesenseHost: string;
  typesensePort: number;
  typesenseProtocol: string;
}) => {
  const url = `${typesenseProtocol}://${typesenseHost}:${typesensePort}/health`;
  const response = await fetch(url);
  const data = await response.json();
  return data;
};
