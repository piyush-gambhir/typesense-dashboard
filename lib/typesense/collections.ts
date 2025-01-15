import { CollectionCreateSchema } from 'typesense/lib/Typesense/Collections';

import typesenseClient from '@/lib/typesense/typesense-client';

export type importAction = 'create' | 'update' | 'upsert' | 'emplace';

export async function getCollections() {
  try {
    const collections = await typesenseClient.collections().retrieve();
    return collections;
  } catch (error) {
    return null;
  }
}

export async function getCollection(collectionName: string) {
  try {
    const collection = await typesenseClient
      .collections(collectionName)
      .retrieve();
    return collection;
  } catch (error) {
    return null;
  }
}

export async function createCollection(schema: CollectionCreateSchema) {
  try {
    const newCollection = await typesenseClient.collections().create(schema);
    return newCollection;
  } catch (error) {
    return null;
  }
}

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
    return null;
  }
}

export async function deleteCollection(collectionName: string) {
  try {
    const deleteResult = await typesenseClient
      .collections(collectionName)
      .delete();
    return deleteResult;
  } catch (error) {
    return null;
  }
}

export async function listDocuments(collectionName: string) {
  try {
    const documents = await typesenseClient
      .collections(collectionName)
      .documents()
      .export();
    return documents;
  } catch (error) {
    return null;
  }
}

export async function exportCollection({
  collectionName,
  includeFields = '*',
  excludeFields,
}: {
  collectionName: string;
  includeFields?: string;
  excludeFields?: string;
}) {
  try {
    const response = await typesenseClient
      .collections(collectionName)
      .documents()
      .export({
        include_fields: includeFields,
        ...(excludeFields && { exclude_fields: excludeFields }),
      });
    return response;
  } catch (error) {
    console.error('Error exporting collection:', error);
    throw error;
  }
}

export async function importCollection(
  collectionName: string,
  action: importAction,
  documents: Record<string, any>[],
) {
  try {
    const importedCollection = await typesenseClient
      .collections(collectionName)
      .documents()
      .import(documents, { action });

    return {
      log: importedCollection,
      successCount: importedCollection.filter((result) => result.success)
        .length,
      failureCount: importedCollection.filter((result) => !result.success)
        .length,
      errors: importedCollection
        .filter((result) => !result.success)
        .map((result) => result.error),
    };
  } catch (error) {
    console.error('Error importing collection:', error);
    throw error;
  }
}
