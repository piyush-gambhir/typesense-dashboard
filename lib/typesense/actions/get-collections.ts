import typesenseClient from "@/lib/typesense/typesenseClient";

export async function getCollections() {
  try {
    const collections = await typesenseClient.collections().retrieve();

    return collections;
  } catch (error) {
    console.error("Error fetching collections:", error);
  }
}
