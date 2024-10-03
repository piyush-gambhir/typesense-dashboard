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

// Create a document in a collection
export async function createDocument(
  collectionName: string,
  document: Record<string, any>,
) {
  try {
    const createdDocument = await typesenseClient
      .collections(collectionName)
      .documents()
      .create(document);
    return createdDocument;
  } catch (error) {
    console.error(
      `Error creating document in collection "${collectionName}":`,
      error,
    );
    return null;
  }
}

// Retrieve a specific document by ID
export async function getDocumentById(
  collectionName: string,
  documentId: string,
) {
  try {
    const document = await typesenseClient
      .collections(collectionName)
      .documents(documentId)
      .retrieve();
    return document;
  } catch (error) {
    console.error(
      `Error retrieving document "${documentId}" from collection "${collectionName}":`,
      error,
    );
    return null;
  }
}

// Update a specific document by ID
export async function updateDocument(
  collectionName: string,
  documentId: string,
  document: Record<string, any>,
) {
  try {
    const updatedDocument = await typesenseClient
      .collections(collectionName)
      .documents(documentId)
      .update(document);
    return updatedDocument;
  } catch (error) {
    console.error(
      `Error updating document "${documentId}" in collection "${collectionName}":`,
      error,
    );
    return null;
  }
}

// Delete a specific document by ID
export async function deleteDocument(
  collectionName: string,
  documentId: string,
) {
  try {
    const deleteResult = await typesenseClient
      .collections(collectionName)
      .documents(documentId)
      .delete();
    return deleteResult;
  } catch (error) {
    console.error(
      `Error deleting document "${documentId}" from collection "${collectionName}":`,
      error,
    );
    return null;
  }
}

export async function getCollectionSchema(collectionName: string) {
  try {
    const schema = await typesenseClient.collections(collectionName).retrieve();
    return schema;
  } catch (error) {
    console.error(
      `Error fetching schema for collection "${collectionName}":`,
      error,
    );
    return null;
  }
}
