'use server';

import { createCollection } from '@/lib/typesense/collections';
import { importCollection } from '@/lib/typesense/collections';
import type { CollectionCreateSchema } from 'typesense/lib/Typesense/Collections';

export const createCollectionWithJsonl = async ({
  collectionName,
  fields,
  fileContent,
}: {
  collectionName: string;
  fields: Array<{ name: string; type: string; facet?: boolean }>;
  fileContent: string;
}) => {
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

  return importResult;
};