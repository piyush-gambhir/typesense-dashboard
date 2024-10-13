import typesenseClient from '@/lib/typesense/typesenseClient';

// Retrieve all collections
export async function getCollections() {
  try {
    const collections = await typesenseClient.collections().retrieve();
    return collections;
  } catch (error) {
    console.error('Error fetching collections:', error);
    return null;
  }
}

// Retrieve a single collection by its name
export async function getCollection(collectionName: string) {
  try {
    const collection = await typesenseClient
      .collections(collectionName)
      .retrieve();
    return collection;
  } catch (error) {
    console.error(`Error fetching collection "${collectionName}":`, error);
    return null;
  }
}

// Create a new collection
export async function createCollection(schema: Record<string, any>) {
  try {
    const newCollection = await typesenseClient.collections().create(schema);
    return newCollection;
  } catch (error) {
    console.error('Error creating collection:', error);
    return null;
  }
}

// Update a collection's schema (useful for schema modification)
export async function updateCollection(
  collectionName: string,
  schema: Record<string, any>,
) {
  try {
    const updatedCollection = await typesenseClient
      .collections(collectionName)
      .update(schema);
    return updatedCollection;
  } catch (error) {
    console.error(`Error updating collection "${collectionName}":`, error);
    return null;
  }
}

// Delete a collection by its name
export async function deleteCollection(collectionName: string) {
  try {
    const deleteResult = await typesenseClient
      .collections(collectionName)
      .delete();
    return deleteResult;
  } catch (error) {
    console.error(`Error deleting collection "${collectionName}":`, error);
    return null;
  }
}

// List all documents in a collection
export async function listDocuments(collectionName: string) {
  try {
    const documents = await typesenseClient
      .collections(collectionName)
      .documents()
      .export();
    return documents;
  } catch (error) {
    console.error(
      `Error fetching documents from collection "${collectionName}":`,
      error,
    );
    return null;
  }
}

export async function exportCollection({
  collectionName,
  includeFields,
  excludeFields,
}: {
  collectionName: string;
  includeFields?: string;
  excludeFields?: string;
}) {
  const collection = await typesenseClient
    .collections(collectionName)
    .documents()
    .export({
      ...(includeFields && { include_fields: includeFields }),
      ...(excludeFields && { exclude_fields: excludeFields }),
    });
  return collection;
}

export async function importCollection(
  collectionName: string,
  documents: Record<string, any>[],
) {
  const importedCollection = await typesenseClient
    .collections(collectionName)
    .documents()
    .import(documents, {
      action: 'create',
    });
  return importedCollection;
}
