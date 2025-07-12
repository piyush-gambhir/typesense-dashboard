import typesenseClient from '@/lib/typesense/typesense-client';

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

type MultiSearchResponse = {
    results: Array<{
        hits?: Array<{ document: Record<string, unknown> }>;
        found?: number;
        facet_counts?: Array<{
            field_name: string;
            counts: Array<{
                value: string;
                count: number;
            }>;
        }>;
    }>;
};

export async function multiSearch({
    searchQueries,
}: Readonly<{
    searchQueries: SearchQuery[];
}>): Promise<MultiSearchResponse | null> {
    try {
        if (!typesenseClient?.multiSearch?.perform) {
            console.error(
                'Typesense client or multiSearch method is not available',
            );
            return null;
        }

        if (!searchQueries || searchQueries.length === 0) {
            console.error('No search queries provided');
            return null;
        }

        const multiSearchRequests = searchQueries.map((query) => {
            const request: Record<string, unknown> = {
                collection: query.collection,
                q: query.q || '*',
                query_by: query.queryBy,
                per_page: query.perPage ?? 10,
                page: query.page ?? 1,
                exhaustive_search: query.exhaustiveSearch ?? true,
            };

            // Only add non-empty filter_by
            if (query.filterBy && query.filterBy.trim() !== '') {
                request.filter_by = query.filterBy;
            }

            // Only add non-empty sort_by
            if (query.sortBy && query.sortBy.trim() !== '') {
                request.sort_by = query.sortBy;
            }

            // Only add non-empty facet_by
            if (query.facetBy && query.facetBy.trim() !== '') {
                request.facet_by = query.facetBy;
                request.max_facet_values = query.maxFacetValues ?? 10;
            }

            // Only add non-empty highlight_full_fields
            if (
                query.highlightFullFields &&
                query.highlightFullFields.trim() !== ''
            ) {
                request.highlight_full_fields = query.highlightFullFields;
            }

            // Only add non-empty facet_query
            if (query.facetQuery && query.facetQuery.trim() !== '') {
                request.facet_query = query.facetQuery;
            }

            // Only add non-empty groupBy
            if (query.groupBy && query.groupBy.trim() !== '') {
                request.group_by = query.groupBy;
            }

            return request;
        });

        console.log('[multiSearch] Processed requests:', multiSearchRequests);

        const response = await typesenseClient.multiSearch.perform({
            searches: multiSearchRequests,
        });

        if (!response || !response.results) {
            console.error(
                'Invalid response from Typesense multiSearch:',
                response,
            );
            return null;
        }

        return response as MultiSearchResponse;
    } catch (error) {
        console.error('Error performing multi-search:', error);
        throw error;
    }
}

// Create a document in a collection
export async function createDocument(
    collectionName: string,
    document: Record<string, unknown>,
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
    document: Record<string, unknown>,
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

// Delete multiple documents by query filter
export async function deleteDocumentsByQuery(
    collectionName: string,
    filterBy: string,
    batchSize?: number,
) {
    try {
        const deleteResult = await typesenseClient
            .collections(collectionName)
            .documents()
            .delete({
                filter_by: filterBy,
                ...(batchSize && { batch_size: batchSize }),
            });
        return deleteResult;
    } catch (error) {
        console.error(
            `Error deleting documents by query in collection "${collectionName}":`,
            error,
        );
        return null;
    }
}

// Upsert a document (insert or update)
export async function upsertDocument(
    collectionName: string,
    document: Record<string, unknown>,
) {
    try {
        const upsertResult = await typesenseClient
            .collections(collectionName)
            .documents()
            .upsert(document);
        return upsertResult;
    } catch (error) {
        console.error(
            `Error upserting document in collection "${collectionName}":`,
            error,
        );
        return null;
    }
}

// Search documents in a collection
export async function searchDocuments(
    collectionName: string,
    query: string,
    queryBy: string,
    filterBy?: string,
    sortBy?: string,
    perPage: number = 10,
    page: number = 1,
) {
    try {
        const searchResults = await typesenseClient
            .collections(collectionName)
            .documents()
            .search({
                q: query,
                query_by: queryBy,
                ...(filterBy && { filter_by: filterBy }),
                ...(sortBy && { sort_by: sortBy }),
                per_page: perPage,
                page: page,
            });
        return searchResults;
    } catch (error) {
        console.error(
            `Error searching documents in collection "${collectionName}":`,
            error,
        );
        return null;
    }
}
