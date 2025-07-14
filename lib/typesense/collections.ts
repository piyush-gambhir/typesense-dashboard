import { CollectionCreateSchema } from 'typesense/lib/Typesense/Collections';
import { getServerTypesenseClient } from '@/lib/typesense/get-server-client';

export type importAction = 'create' | 'update' | 'upsert' | 'emplace';

export async function getCollections() {
    try {
    const typesenseClient = await getServerTypesenseClient();
        const collections = await typesenseClient.collections().retrieve();
        return {
            success: true,
            data: collections,
        };
    } catch (error) {
        console.error('Error fetching collections:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}

export async function getCollection(collectionName: string) {
    try {
    const typesenseClient = await getServerTypesenseClient();
        const collection = await typesenseClient
            .collections(collectionName)
            .retrieve();

        if (!collection) {
            return {
                success: false,
                error: 'Collection not found',
            };
        }

        return {
            success: true,
            data: collection,
        };
    } catch (error) {
        console.error('Error fetching collection:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}

export async function createCollection(schema: CollectionCreateSchema) {
    try {
    const typesenseClient = await getServerTypesenseClient();
        const newCollection = await typesenseClient
            .collections()
            .create(schema);
        return newCollection;
    } catch {
        return null;
    }
}

export async function updateCollection(
    collectionName: string,
    schema: Record<string, any>,
) {
    try {
        // Validate collection name
        if (!collectionName || typeof collectionName !== 'string') {
            throw new Error('Invalid collection name');
        }

        // Check for valid collection name format (alphanumeric and underscores only)
        if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(collectionName)) {
            throw new Error(
                `Collection name '${collectionName}' contains invalid characters. Use only letters, numbers, and underscores, starting with a letter or underscore`,
            );
        }

        // First, let's verify the collection exists and get its current state
        console.log('Checking if collection exists:', collectionName);

        // Test if we can access the API at all
        try {
            const collections = await typesenseClient.collections().retrieve();
            console.log(
                'Available collections:',
                collections.map((c: any) => c.name),
            );
        } catch (apiError) {
            console.error('Cannot access Typesense API:', apiError);
            throw new Error(
                'Cannot access Typesense API. Check your connection settings and API key.',
            );
        }

        const existingCollection = await typesenseClient
            .collections(collectionName)
            .retrieve();
        console.log('Existing collection:', existingCollection);

        // Check if we're trying to modify existing fields (which is not allowed)
        if (existingCollection.fields && schema.fields) {
            // Find fields that exist in both but might have different types
            const modifiedFields = schema.fields.filter((newField: any) => {
                const existingField = existingCollection.fields.find(
                    (f: any) => f.name === newField.name,
                );
                return existingField && existingField.type !== newField.type;
            });

            if (modifiedFields.length > 0) {
                console.warn(
                    'Attempting to modify field types, which may not be allowed:',
                    modifiedFields,
                );
            }
        }

        // For collection updates, we need to send only the fields array
        // and any other specific properties that can be updated
        const updateData: Record<string, any> = {};

        if (schema.fields) {
            // Validate fields before sending
            const validFieldTypes = [
                'string',
                'int32',
                'int64',
                'float',
                'bool',
                'string[]',
                'int32[]',
                'int64[]',
                'float[]',
                'bool[]',
            ];

            // Get existing field names
            const existingFieldNames = existingCollection.fields.map(
                (f: any) => f.name,
            );

            // Filter to only include new fields (Typesense only allows adding new fields)
            const newFields = schema.fields.filter(
                (field: any) => !existingFieldNames.includes(field.name),
            );

            if (newFields.length === 0) {
                console.log('No new fields to add');
                // If no new fields, we can still update other properties
            } else {
                // Check if we're trying to modify existing fields
                const modifiedFields = schema.fields.filter((field: any) => {
                    const existingField = existingCollection.fields.find(
                        (f: any) => f.name === field.name,
                    );
                    return (
                        existingField &&
                        (existingField.type !== field.type ||
                            existingField.facet !== field.facet ||
                            existingField.index !== field.index ||
                            existingField.optional !== field.optional ||
                            existingField.sort !== field.sort ||
                            existingField.store !== field.store)
                    );
                });

                if (modifiedFields.length > 0) {
                    console.warn(
                        'Attempting to modify existing fields, which may not be allowed:',
                        modifiedFields.map((f: any) => f.name),
                    );
                }
                console.log(
                    'Adding new fields:',
                    newFields.map((f: any) => f.name),
                );

                // Format fields to match Typesense API expectations
                updateData.fields = newFields.map((field: any) => {
                    // Validate field name
                    if (!field.name || typeof field.name !== 'string') {
                        throw new Error(`Invalid field name: ${field.name}`);
                    }

                    // Check for reserved field names
                    const reservedNames = ['id', '_id', 'id_'];
                    if (reservedNames.includes(field.name)) {
                        throw new Error(
                            `Field name '${field.name}' is reserved and cannot be used`,
                        );
                    }

                    // Check for valid field name format (alphanumeric and underscores only)
                    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(field.name)) {
                        throw new Error(
                            `Field name '${field.name}' contains invalid characters. Use only letters, numbers, and underscores, starting with a letter or underscore`,
                        );
                    }

                    // Validate field type
                    if (!field.type || !validFieldTypes.includes(field.type)) {
                        throw new Error(
                            `Invalid field type: ${field.type} for field ${field.name}`,
                        );
                    }

                    return {
                        name: field.name,
                        type: field.type,
                        ...(field.facet !== undefined && {
                            facet: field.facet,
                        }),
                        ...(field.index !== undefined && {
                            index: field.index,
                        }),
                        ...(field.optional !== undefined && {
                            optional: field.optional,
                        }),
                        ...(field.sort !== undefined && { sort: field.sort }),
                        ...(field.store !== undefined && {
                            store: field.store,
                        }),
                    };
                });
            }
        }

        if (schema.default_sorting_field !== undefined) {
            updateData.default_sorting_field = schema.default_sorting_field;
        }

        if (schema.enable_nested_fields !== undefined) {
            updateData.enable_nested_fields = schema.enable_nested_fields;
        }

        console.log('Updating collection with data:', updateData);

        // Check if we have any data to update
        if (Object.keys(updateData).length === 0) {
            console.log('No data to update');
            return existingCollection; // Return the existing collection if nothing to update
        }

        const updatedCollection = await typesenseClient
            .collections(collectionName)
            .update(updateData);
        return updatedCollection;
    } catch (error) {
        console.error('Error updating collection:', error);

        // Log more details about the error
        if (error instanceof Error) {
            console.error('Error message:', error.message);
            console.error('Error stack:', error.stack);
        }

        // If it's a response error, try to get more details
        if (error && typeof error === 'object' && 'response' in error) {
            const responseError = error as any;
            console.error('Response status:', responseError.response?.status);
            console.error('Response data:', responseError.response?.data);
        }

        return null;
    }
}

export async function deleteCollection(collectionName: string) {
    try {
    const typesenseClient = await getServerTypesenseClient();
        const deleteResult = await typesenseClient
            .collections(collectionName)
            .delete();
        return deleteResult;
    } catch {
        return null;
    }
}

export async function listDocuments(collectionName: string) {
    try {
        const typesenseClient = await getServerTypesenseClient();
        const documents = await typesenseClient
            .collections(collectionName)
            .documents()
            .export();
        return documents;
    } catch {
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
    const typesenseClient = await getServerTypesenseClient();
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

export async function createCollectionWithJsonl({
    collectionName,
    fields,
    fileContent,
}: {
    collectionName: string;
    fields: Array<{ name: string; type: string; facet?: boolean }>;
    fileContent: string;
}) {
    const typesenseClient = await getServerTypesenseClient();
    try {
        // Create schema with proper typing
        const schema: CollectionCreateSchema = {
            name: collectionName,
            fields: fields.map((field) => ({
                name: field.name,
                type: field.type as any, // Type assertion needed for string to FieldType conversion
                facet: field.facet,
            })),
        };

        const createCollectionResponse = await createCollection(schema);

        if (createCollectionResponse?.name !== collectionName) {
            return {
                success: false,
                error: 'Failed to create collection',
            };
        }

        const documents = fileContent
            .split('\n')
            .filter(Boolean)
            .map((line) => JSON.parse(line));

        const importResult = await importCollection(
            collectionName,
            'create',
            documents,
        );

        return {
            success: true,
            data: importResult,
        };
    } catch (error) {
        console.error('Error creating collection with JSONL:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}

// Get collection statistics
export async function getCollectionStats(collectionName: string) {
    const typesenseClient = await getServerTypesenseClient();
    try {
        const stats = await typesenseClient
            .collections(collectionName)
            .documents()
            .search({
                q: '*',
                per_page: 0,
            });

        return {
            success: true,
            data: {
                total_documents: stats.found,
                collection_name: collectionName,
                timestamp: new Date().toISOString(),
            },
        };
    } catch (error) {
        console.error('Error fetching collection stats:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}

// Get collection health status
export async function getCollectionHealth(collectionName: string) {
    const typesenseClient = await getServerTypesenseClient();
    try {
        // Try to access the collection
        const collection = await typesenseClient
            .collections(collectionName)
            .retrieve();

        // Try a simple search to check if collection is responsive
        const searchResult = await typesenseClient
            .collections(collectionName)
            .documents()
            .search({
                q: '*',
                per_page: 1,
            });

        return {
            success: true,
            data: {
                status: 'healthy',
                collection_name: collectionName,
                num_documents: searchResult.found,
                schema_version: collection.num_memory_shards || 1,
                timestamp: new Date().toISOString(),
            },
        };
    } catch (error) {
        console.error('Error checking collection health:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            data: {
                status: 'unhealthy',
                collection_name: collectionName,
                timestamp: new Date().toISOString(),
            },
        };
    }
}

// Validate collection schema
export async function validateCollectionSchema(schema: CollectionCreateSchema) {
    const typesenseClient = await getServerTypesenseClient();
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
        // Validate collection name
        if (!schema.name || typeof schema.name !== 'string') {
            errors.push('Collection name is required and must be a string');
        } else if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(schema.name)) {
            errors.push(
                'Collection name must start with a letter or underscore and contain only letters, numbers, and underscores',
            );
        }

        // Validate fields
        if (
            !schema.fields ||
            !Array.isArray(schema.fields) ||
            schema.fields.length === 0
        ) {
            errors.push('At least one field is required');
        } else {
            const validFieldTypes = [
                'string',
                'int32',
                'int64',
                'float',
                'bool',
                'string[]',
                'int32[]',
                'int64[]',
                'float[]',
                'bool[]',
                'object',
                'object[]',
                'auto',
            ];

            const fieldNames = new Set<string>();
            const reservedNames = ['id', '_id', 'id_'];

            schema.fields.forEach((field, index) => {
                // Check field name
                if (!field.name || typeof field.name !== 'string') {
                    errors.push(
                        `Field ${index}: Name is required and must be a string`,
                    );
                } else if (reservedNames.includes(field.name)) {
                    errors.push(
                        `Field ${index}: Name '${field.name}' is reserved and cannot be used`,
                    );
                } else if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(field.name)) {
                    errors.push(
                        `Field ${index}: Name '${field.name}' contains invalid characters`,
                    );
                } else if (fieldNames.has(field.name)) {
                    errors.push(
                        `Field ${index}: Duplicate field name '${field.name}'`,
                    );
                } else {
                    fieldNames.add(field.name);
                }

                // Check field type
                if (!field.type || !validFieldTypes.includes(field.type)) {
                    errors.push(
                        `Field ${index}: Invalid field type '${field.type}'`,
                    );
                }

                // Check for potential issues
                if (field.type === 'auto' && field.facet) {
                    warnings.push(
                        `Field ${index}: Auto fields may not work well with faceting`,
                    );
                }

                if (field.type.includes('[]') && field.sort) {
                    warnings.push(
                        `Field ${index}: Array fields cannot be used for sorting`,
                    );
                }
            });
        }

        // Validate default sorting field
        if (schema.default_sorting_field) {
            const fieldExists = schema.fields?.some(
                (f) => f.name === schema.default_sorting_field,
            );
            if (!fieldExists) {
                errors.push('Default sorting field must exist in the schema');
            } else {
                const field = schema.fields?.find(
                    (f) => f.name === schema.default_sorting_field,
                );
                if (
                    field &&
                    !['int32', 'int64', 'float'].includes(field.type)
                ) {
                    errors.push(
                        'Default sorting field must be a numeric type (int32, int64, float)',
                    );
                }
            }
        }

        return {
            success: errors.length === 0,
            errors,
            warnings,
            schema,
        };
    } catch (error) {
        return {
            success: false,
            errors: [
                error instanceof Error
                    ? error.message
                    : 'Unknown validation error',
            ],
            warnings: [],
            schema,
        };
    }
}

// Get collection configuration
export async function getCollectionConfig(collectionName: string) {
    const typesenseClient = await getServerTypesenseClient();
    try {
        const collection = await typesenseClient
            .collections(collectionName)
            .retrieve();

        return {
            success: true,
            data: {
                name: collection.name,
                num_documents: collection.num_documents,
                num_memory_shards: collection.num_memory_shards,
                fields: collection.fields,
                default_sorting_field: collection.default_sorting_field,
                enable_nested_fields: collection.enable_nested_fields,
                created_at: collection.created_at,
            },
        };
    } catch (error) {
        console.error('Error fetching collection config:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}

// Update collection configuration
export async function updateCollectionConfig(
    collectionName: string,
    config: {
        default_sorting_field?: string;
        enable_nested_fields?: boolean;
    },
) {
    try {
        const updateData: Record<string, any> = {};

        if (config.default_sorting_field !== undefined) {
            updateData.default_sorting_field = config.default_sorting_field;
        }

        if (config.enable_nested_fields !== undefined) {
            updateData.enable_nested_fields = config.enable_nested_fields;
        }

        if (Object.keys(updateData).length === 0) {
            return {
                success: false,
                error: 'No configuration changes provided',
            };
        }

        const updatedCollection = await typesenseClient
            .collections(collectionName)
            .update(updateData);

        return {
            success: true,
            data: updatedCollection,
        };
    } catch (error) {
        console.error('Error updating collection config:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}

// Get collection field details
export async function getCollectionFields(collectionName: string) {
    const typesenseClient = await getServerTypesenseClient();
    try {
        const collection = await typesenseClient
            .collections(collectionName)
            .retrieve();

        const fields = collection.fields.map((field: any) => ({
            name: field.name,
            type: field.type,
            facet: field.facet || false,
            index: field.index !== false, // Default to true if not specified
            optional: field.optional || false,
            sort: field.sort || false,
            store: field.store !== false, // Default to true if not specified
        }));

        return {
            success: true,
            data: fields,
        };
    } catch (error) {
        console.error('Error fetching collection fields:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}

// Add new fields to collection
export async function addCollectionFields(
    collectionName: string,
    fields: Array<{
        name: string;
        type: string;
        facet?: boolean;
        index?: boolean;
        optional?: boolean;
        sort?: boolean;
        store?: boolean;
    }>,
) {
    try {
        const validatedFields = fields.map((field) => ({
            name: field.name,
            type: field.type as any, // Type assertion for FieldType
            ...(field.facet !== undefined && { facet: field.facet }),
            ...(field.index !== undefined && { index: field.index }),
            ...(field.optional !== undefined && { optional: field.optional }),
            ...(field.sort !== undefined && { sort: field.sort }),
            ...(field.store !== undefined && { store: field.store }),
        }));

        const updatedCollection = await typesenseClient
            .collections(collectionName)
            .update({ fields: validatedFields });

        return {
            success: true,
            data: updatedCollection,
        };
    } catch (error) {
        console.error('Error adding collection fields:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}

// Get collection backup (export with metadata)
export async function backupCollection(collectionName: string) {
    const typesenseClient = await getServerTypesenseClient();
    try {
        // Get collection schema
        const collection = await typesenseClient
            .collections(collectionName)
            .retrieve();

        // Export all documents
        const documents = await typesenseClient
            .collections(collectionName)
            .documents()
            .export();

        const backup = {
            collection_schema: {
                name: collection.name,
                fields: collection.fields,
                default_sorting_field: collection.default_sorting_field,
                enable_nested_fields: collection.enable_nested_fields,
            },
            documents: documents
                .split('\n')
                .filter(Boolean)
                .map((line) => JSON.parse(line)),
            backup_timestamp: new Date().toISOString(),
            total_documents: collection.num_documents,
        };

        return {
            success: true,
            data: backup,
        };
    } catch (error) {
        console.error('Error creating collection backup:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}

// Restore collection from backup
export async function restoreCollection(backup: any) {
    const typesenseClient = await getServerTypesenseClient();
    try {
        // Create collection with schema
        const newCollection = await typesenseClient
            .collections()
            .create(backup.collection_schema);

        // Import documents
        if (backup.documents && backup.documents.length > 0) {
            const importResult = await typesenseClient
                .collections(backup.collection_schema.name)
                .documents()
                .import(backup.documents, { action: 'create' });

            return {
                success: true,
                data: {
                    collection: newCollection,
                    import_result: importResult,
                },
            };
        }

        return {
            success: true,
            data: {
                collection: newCollection,
                import_result: null,
            },
        };
    } catch (error) {
        console.error('Error restoring collection:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}
