import typesenseClient from '@/lib/typesense/typesenseClient';

type SearchQuery = {
  collection: string;
  q: string;
  queryBy: string;
  filterBy?: string;
  sortBy?: string;
  perPage?: number;
  page?: number;
  exhaustiveSearch?: boolean;
  facetBy?: string;
  highlightFullFields?: string;
  groupBy?: string;
  maxFacetValues?: number;
  facetQuery?: string;
};

export async function multiSearch({
  searchQueries,
}: {
  searchQueries: SearchQuery[];
}) {
  try {
    const multiSearchRequests = searchQueries.map((query) => ({
      collection: query.collection,
      q: query.q,
      query_by: query.queryBy,
      filter_by: query.filterBy ?? '',
      sort_by: query.sortBy ?? '',
      facet_by: query.facetBy ?? '',
      facet_query: query.facetQuery ?? '',
      highlight_full_fields: query.highlightFullFields ?? '',
      max_facet_values: query.maxFacetValues ?? 10,
      per_page: query.perPage ?? 10,
      page: query.page ?? 1,
      exhaustive_search: query.exhaustiveSearch ?? true,
    }));

    const response = await typesenseClient?.multiSearch?.perform({
      searches: multiSearchRequests,
    });

    return response ?? null;
  } catch (error) {
    console.error('Error performing multi-search:', error);
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
