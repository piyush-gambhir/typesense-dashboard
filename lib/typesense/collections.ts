import { CollectionCreateSchema } from 'typesense/lib/Typesense/Collections';

import typesenseClient from '@/lib/typesense/typesense-client';

export type importAction = 'create' | 'update' | 'upsert' | 'emplace';

export async function getCollections() {
  try {
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
    if (!typesenseClient?.collections) {
      console.error('Typesense client is not available');
      return {
        success: false,
        error: 'Typesense client is not available',
      };
    }

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
    // Validate collection name
    if (!collectionName || typeof collectionName !== 'string') {
      throw new Error('Invalid collection name');
    }
    
    // Check for valid collection name format (alphanumeric and underscores only)
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(collectionName)) {
      throw new Error(`Collection name '${collectionName}' contains invalid characters. Use only letters, numbers, and underscores, starting with a letter or underscore`);
    }
    
    // First, let's verify the collection exists and get its current state
    console.log('Checking if collection exists:', collectionName);
    
    // Test if we can access the API at all
    try {
      const collections = await typesenseClient.collections().retrieve();
      console.log('Available collections:', collections.map((c: any) => c.name));
    } catch (apiError) {
      console.error('Cannot access Typesense API:', apiError);
      throw new Error('Cannot access Typesense API. Check your connection settings and API key.');
    }
    
    const existingCollection = await typesenseClient
      .collections(collectionName)
      .retrieve();
    console.log('Existing collection:', existingCollection);
    
    // Check if we're trying to modify existing fields (which is not allowed)
    if (existingCollection.fields && schema.fields) {
      const existingFieldNames = existingCollection.fields.map((f: any) => f.name);
      const newFieldNames = schema.fields.map((f: any) => f.name);
      
      // Find fields that exist in both but might have different types
      const modifiedFields = schema.fields.filter((newField: any) => {
        const existingField = existingCollection.fields.find((f: any) => f.name === newField.name);
        return existingField && existingField.type !== newField.type;
      });
      
      if (modifiedFields.length > 0) {
        console.warn('Attempting to modify field types, which may not be allowed:', modifiedFields);
      }
    }
    
    // For collection updates, we need to send only the fields array
    // and any other specific properties that can be updated
    const updateData: Record<string, any> = {};
    
    if (schema.fields) {
      // Validate fields before sending
      const validFieldTypes = [
        'string', 'int32', 'int64', 'float', 'bool',
        'string[]', 'int32[]', 'int64[]', 'float[]', 'bool[]'
      ];
      
      // Get existing field names
      const existingFieldNames = existingCollection.fields.map((f: any) => f.name);
      
      // Filter to only include new fields (Typesense only allows adding new fields)
      const newFields = schema.fields.filter((field: any) => !existingFieldNames.includes(field.name));
      
      if (newFields.length === 0) {
        console.log('No new fields to add');
        // If no new fields, we can still update other properties
      } else {
        // Check if we're trying to modify existing fields
        const modifiedFields = schema.fields.filter((field: any) => {
          const existingField = existingCollection.fields.find((f: any) => f.name === field.name);
          return existingField && (
            existingField.type !== field.type ||
            existingField.facet !== field.facet ||
            existingField.index !== field.index ||
            existingField.optional !== field.optional ||
            existingField.sort !== field.sort ||
            existingField.store !== field.store
          );
        });
        
        if (modifiedFields.length > 0) {
          console.warn('Attempting to modify existing fields, which may not be allowed:', modifiedFields.map((f: any) => f.name));
        }
        console.log('Adding new fields:', newFields.map((f: any) => f.name));
        
        // Format fields to match Typesense API expectations
        updateData.fields = newFields.map((field: any) => {
          // Validate field name
          if (!field.name || typeof field.name !== 'string') {
            throw new Error(`Invalid field name: ${field.name}`);
          }
          
          // Check for reserved field names
          const reservedNames = ['id', '_id', 'id_'];
          if (reservedNames.includes(field.name)) {
            throw new Error(`Field name '${field.name}' is reserved and cannot be used`);
          }
          
          // Check for valid field name format (alphanumeric and underscores only)
          if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(field.name)) {
            throw new Error(`Field name '${field.name}' contains invalid characters. Use only letters, numbers, and underscores, starting with a letter or underscore`);
          }
          
          // Validate field type
          if (!field.type || !validFieldTypes.includes(field.type)) {
            throw new Error(`Invalid field type: ${field.type} for field ${field.name}`);
          }
          
          return {
            name: field.name,
            type: field.type,
            ...(field.facet !== undefined && { facet: field.facet }),
            ...(field.index !== undefined && { index: field.index }),
            ...(field.optional !== undefined && { optional: field.optional }),
            ...(field.sort !== undefined && { sort: field.sort }),
            ...(field.store !== undefined && { store: field.store }),
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

export async function createCollectionWithJsonl({
  collectionName,
  fields,
  fileContent,
}: {
  collectionName: string;
  fields: Array<{ name: string; type: string; facet?: boolean }>;
  fileContent: string;
}) {
  try {
    // Create schema with proper typing
    const schema: CollectionCreateSchema = {
      name: collectionName,
      fields: fields.map(field => ({
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
      documents
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
