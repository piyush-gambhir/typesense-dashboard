import { getTypesenseClient } from '@/lib/typesense/typesense-client';

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
        const typesenseClient = getTypesenseClient();

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
                per_page: query.perPage ?? 10,
                page: query.page ?? 1,
                exhaustive_search: query.exhaustiveSearch ?? true,
            };


            if (
                query.queryBy &&
                query.queryBy.trim() !== '' &&
                query.queryBy !== '*'
            ) {
                request.query_by = query.queryBy;
            }


            if (query.filterBy && query.filterBy.trim() !== '') {
                request.filter_by = query.filterBy;
            }


            if (query.sortBy && query.sortBy.trim() !== '') {
                request.sort_by = query.sortBy;
            }


            if (query.facetBy && query.facetBy.trim() !== '') {
                request.facet_by = query.facetBy;
                request.max_facet_values = query.maxFacetValues ?? 10;
            }


            if (
                query.highlightFullFields &&
                query.highlightFullFields.trim() !== ''
            ) {
                request.highlight_full_fields = query.highlightFullFields;
            }


            if (query.facetQuery && query.facetQuery.trim() !== '') {
                request.facet_query = query.facetQuery;
            }


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


export async function createDocument(
    collectionName: string,
    document: Record<string, unknown>,
) {
    try {
        const typesenseClient = getTypesenseClient();
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


export async function getDocumentById(
    collectionName: string,
    documentId: string,
) {
    try {
        const typesenseClient = getTypesenseClient();
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


export async function updateDocument(
    collectionName: string,
    documentId: string,
    document: Record<string, unknown>,
) {
    try {
        const typesenseClient = getTypesenseClient();
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


export async function deleteDocument(
    collectionName: string,
    documentId: string,
) {
    try {
        const typesenseClient = getTypesenseClient();
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


export async function deleteDocumentsByQuery(
    collectionName: string,
    filterBy: string,
    batchSize?: number,
) {
    try {
        const typesenseClient = getTypesenseClient();
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


export async function upsertDocument(
    collectionName: string,
    document: Record<string, unknown>,
) {
    try {
        const typesenseClient = getTypesenseClient();
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
        const typesenseClient = getTypesenseClient();
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


export async function bulkCreateDocuments(
    collectionName: string,
    documents: Record<string, unknown>[],
) {
    try {
        const typesenseClient = getTypesenseClient();
        const bulkResult = await typesenseClient
            .collections(collectionName)
            .documents()
            .import(documents, { action: 'create' });
        return {
            success: true,
            data: bulkResult,
            successCount: bulkResult.filter((result) => result.success).length,
            failureCount: bulkResult.filter((result) => !result.success).length,
            errors: bulkResult
                .filter((result) => !result.success)
                .map((result) => result.error),
        };
    } catch (error) {
        console.error(
            `Error bulk creating documents in collection "${collectionName}":`,
            error,
        );
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}


export async function bulkUpdateDocuments(
    collectionName: string,
    documents: Record<string, unknown>[],
) {
    try {
        const typesenseClient = getTypesenseClient();
        const bulkResult = await typesenseClient
            .collections(collectionName)
            .documents()
            .import(documents, { action: 'update' });
        return {
            success: true,
            data: bulkResult,
            successCount: bulkResult.filter((result) => result.success).length,
            failureCount: bulkResult.filter((result) => !result.success).length,
            errors: bulkResult
                .filter((result) => !result.success)
                .map((result) => result.error),
        };
    } catch (error) {
        console.error(
            `Error bulk updating documents in collection "${collectionName}":`,
            error,
        );
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}


export async function bulkUpsertDocuments(
    collectionName: string,
    documents: Record<string, unknown>[],
) {
    try {
        const typesenseClient = getTypesenseClient();
        const bulkResult = await typesenseClient
            .collections(collectionName)
            .documents()
            .import(documents, { action: 'upsert' });
        return {
            success: true,
            data: bulkResult,
            successCount: bulkResult.filter((result) => result.success).length,
            failureCount: bulkResult.filter((result) => !result.success).length,
            errors: bulkResult
                .filter((result) => !result.success)
                .map((result) => result.error),
        };
    } catch (error) {
        console.error(
            `Error bulk upserting documents in collection "${collectionName}":`,
            error,
        );
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}


export async function emplaceDocument(
    collectionName: string,
    document: Record<string, unknown>,
) {
    try {
        const typesenseClient = getTypesenseClient();
        const emplaceResult = await typesenseClient
            .collections(collectionName)
            .documents()
            .import([document], { action: 'emplace' });
        return emplaceResult[0];
    } catch (error) {
        console.error(
            `Error emplacing document in collection "${collectionName}":`,
            error,
        );
        return null;
    }
}


export async function getDocumentCount(
    collectionName: string,
    filterBy?: string,
) {
    try {
        const typesenseClient = getTypesenseClient();
        const searchResult = await typesenseClient
            .collections(collectionName)
            .documents()
            .search({
                q: '*',
                per_page: 0,
                ...(filterBy && { filter_by: filterBy }),
            } as any);
        return searchResult.found || 0;
    } catch (error) {
        console.error(
            `Error getting document count for collection "${collectionName}":`,
            error,
        );
        return null;
    }
}


export async function documentExists(
    collectionName: string,
    documentId: string,
) {
    try {
        const typesenseClient = getTypesenseClient();
        await typesenseClient
            .collections(collectionName)
            .documents(documentId)
            .retrieve();
        return true;
    } catch (error) {
        return false;
    }
}


export async function bulkDeleteDocuments(
    collectionName: string,
    documentIds: string[],
) {
    try {
        const typesenseClient = getTypesenseClient();
        const deletePromises = documentIds.map((id) =>
            typesenseClient.collections(collectionName).documents(id).delete(),
        );
        const results = await Promise.allSettled(deletePromises);

        const successful = results.filter(
            (result) => result.status === 'fulfilled',
        ).length;
        const failed = results.filter(
            (result) => result.status === 'rejected',
        ).length;

        return {
            success: true,
            successCount: successful,
            failureCount: failed,
            results: results.map((result, index) => ({
                id: documentIds[index],
                success: result.status === 'fulfilled',
                error:
                    result.status === 'rejected'
                        ? (result as PromiseRejectedResult).reason
                        : null,
            })),
        };
    } catch (error) {
        console.error(
            `Error bulk deleting documents in collection "${collectionName}":`,
            error,
        );
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}


export async function getDocumentFieldStats(
    collectionName: string,
    fieldName: string,
    filterBy?: string,
) {
    try {
        const typesenseClient = getTypesenseClient();
        const searchResult = await typesenseClient
            .collections(collectionName)
            .documents()
            .search({
                q: '*',
                per_page: 0,
                facet_by: fieldName,
                max_facet_values: 1000,
                ...(filterBy && { filter_by: filterBy }),
            } as any);

        const facetCounts = searchResult.facet_counts?.[0]?.counts || [];
        const totalCount = searchResult.found || 0;

        return {
            success: true,
            data: {
                fieldName,
                totalDocuments: totalCount,
                uniqueValues: facetCounts.length,
                valueDistribution: facetCounts,
                topValues: facetCounts.slice(0, 10),
            },
        };
    } catch (error) {
        console.error(
            `Error getting field stats for "${fieldName}" in collection "${collectionName}":`,
            error,
        );
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}


export async function getDocumentMetadata(
    collectionName: string,
    documentId: string,
) {
    try {
        const typesenseClient = getTypesenseClient();
        const document = await typesenseClient
            .collections(collectionName)
            .documents(documentId)
            .retrieve();


        const metadata = {
            id: (document as any).id,
            created_at: (document as any).created_at,
            updated_at: (document as any).updated_at,

        };

        return {
            success: true,
            data: metadata,
        };
    } catch (error) {
        console.error(
            `Error getting metadata for document "${documentId}" in collection "${collectionName}":`,
            error,
        );
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}


export async function updateDocumentMetadata(
    collectionName: string,
    documentId: string,
    metadata: Record<string, unknown>,
) {
    try {
        const typesenseClient = getTypesenseClient();
        const updatedDocument = await typesenseClient
            .collections(collectionName)
            .documents(documentId)
            .update(metadata);
        return {
            success: true,
            data: updatedDocument,
        };
    } catch (error) {
        console.error(
            `Error updating metadata for document "${documentId}" in collection "${collectionName}":`,
            error,
        );
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}


export async function getDocumentsByFilter(
    collectionName: string,
    filterBy: string,
    sortBy?: string,
    perPage: number = 10,
    page: number = 1,
) {
    try {
        const typesenseClient = getTypesenseClient();
        const documents = await typesenseClient
            .collections(collectionName)
            .documents()
            .search({
                q: '*',
                filter_by: filterBy,
                ...(sortBy && { sort_by: sortBy }),
                per_page: perPage,
                page: page,
            } as any);
        return {
            success: true,
            data: documents,
        };
    } catch (error) {
        console.error(
            `Error getting documents by filter in collection "${collectionName}":`,
            error,
        );
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}


export async function getAllDocuments(
    collectionName: string,
    perPage: number = 100,
    page: number = 1,
    sortBy?: string,
) {
    try {
        const typesenseClient = getTypesenseClient();
        const documents = await typesenseClient
            .collections(collectionName)
            .documents()
            .search({
                q: '*',
                ...(sortBy && { sort_by: sortBy }),
                per_page: perPage,
                page: page,
            } as any);
        return {
            success: true,
            data: documents,
        };
    } catch (error) {
        console.error(
            `Error getting all documents in collection "${collectionName}":`,
            error,
        );
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}


export async function validateDocument(
    collectionName: string,
    document: Record<string, unknown>,
) {
    try {
        const typesenseClient = getTypesenseClient();

        const collection = await typesenseClient
            .collections(collectionName)
            .retrieve();

        const validationErrors: string[] = [];
        const fields = collection.fields || [];


        fields.forEach((field) => {
            if (!field.optional && !(field.name in document)) {
                validationErrors.push(`Missing required field: ${field.name}`);
            }
        });


        Object.entries(document).forEach(([key, value]) => {
            const field = fields.find((f) => f.name === key);
            if (field) {
                switch (field.type) {
                    case 'string':
                        if (typeof value !== 'string') {
                            validationErrors.push(
                                `Field ${key} must be a string`,
                            );
                        }
                        break;
                    case 'int32':
                    case 'int64':
                        if (
                            typeof value !== 'number' ||
                            !Number.isInteger(value)
                        ) {
                            validationErrors.push(
                                `Field ${key} must be an integer`,
                            );
                        }
                        break;
                    case 'float':
                        if (typeof value !== 'number') {
                            validationErrors.push(
                                `Field ${key} must be a number`,
                            );
                        }
                        break;
                    case 'bool':
                        if (typeof value !== 'boolean') {
                            validationErrors.push(
                                `Field ${key} must be a boolean`,
                            );
                        }
                        break;
                    case 'string[]':
                        if (
                            !Array.isArray(value) ||
                            !value.every((v) => typeof v === 'string')
                        ) {
                            validationErrors.push(
                                `Field ${key} must be an array of strings`,
                            );
                        }
                        break;
                    case 'int32[]':
                    case 'int64[]':
                        if (
                            !Array.isArray(value) ||
                            !value.every(
                                (v) =>
                                    typeof v === 'number' &&
                                    Number.isInteger(v),
                            )
                        ) {
                            validationErrors.push(
                                `Field ${key} must be an array of integers`,
                            );
                        }
                        break;
                    case 'float[]':
                        if (
                            !Array.isArray(value) ||
                            !value.every((v) => typeof v === 'number')
                        ) {
                            validationErrors.push(
                                `Field ${key} must be an array of numbers`,
                            );
                        }
                        break;
                    case 'bool[]':
                        if (
                            !Array.isArray(value) ||
                            !value.every((v) => typeof v === 'boolean')
                        ) {
                            validationErrors.push(
                                `Field ${key} must be an array of booleans`,
                            );
                        }
                        break;
                }
            }
        });

        return {
            success: validationErrors.length === 0,
            isValid: validationErrors.length === 0,
            errors: validationErrors,
            fieldCount: fields.length,
            documentFieldCount: Object.keys(document).length,
        };
    } catch (error) {
        console.error(
            `Error validating document for collection "${collectionName}":`,
            error,
        );
        return {
            success: false,
            isValid: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}


export async function getDocumentSuggestions(
    collectionName: string,
    query: string,
    fieldName: string,
    limit: number = 10,
) {
    try {
        const typesenseClient = getTypesenseClient();
        const suggestions = await typesenseClient
            .collections(collectionName)
            .documents()
            .search({
                q: query,
                query_by: fieldName,
                per_page: limit,
                sort_by: '_text_match:desc',
            });

        const uniqueValues = new Set<string>();
        const results: string[] = [];

        suggestions.hits?.forEach((hit) => {
            const value = (hit.document as any)[fieldName];
            if (
                value &&
                typeof value === 'string' &&
                !uniqueValues.has(value)
            ) {
                uniqueValues.add(value);
                results.push(value);
            }
        });

        return {
            success: true,
            data: results.slice(0, limit),
        };
    } catch (error) {
        console.error(
            `Error getting suggestions for field "${fieldName}" in collection "${collectionName}":`,
            error,
        );
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}
