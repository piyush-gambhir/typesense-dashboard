import { useState, useEffect } from 'react';
import { getCollection } from '@/lib/typesense/collections';

export interface CollectionSchema {
  fields: { name: string; type: string; facet: boolean; sort?: boolean; index?: boolean }[];
}

export interface SchemaOptions {
  sortDropdownOptions: { label: string; value: string }[];
  countDropdownOptions: { label: string; value: number }[];
}

export function useCollectionSchema(collectionName: string) {
  const [collectionSchema, setCollectionSchema] = useState<CollectionSchema | null>(null);
  const [indexFields, setIndexFields] = useState<string[]>([]);
  const [facetFields, setFacetFields] = useState<string[]>([]);
  const [sortDropdownOptions, setSortDropdownOptions] = useState<{ label: string; value: string }[]>([]);
  const [countDropdownOptions, setCountDropdownOptions] = useState<{ label: string; value: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSchema = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const schemaResponse = await getCollection(collectionName);

        if (
          schemaResponse?.success &&
          schemaResponse?.data?.fields &&
          Array.isArray(schemaResponse.data.fields)
        ) {
          // Store all facetable fields for UI rendering
          const allFacetFields = schemaResponse.data.fields
            ?.filter((field) => field.facet === true)
            .map((field) => field.name) ?? [];

          // Filter index fields to only include string and string[] types for query_by
          const indexFields = schemaResponse.data.fields
            ?.filter((field) =>
              field.index === true &&
              (field.type === 'string' || field.type === 'string[]')
            )
            .map((field) => field.name) ?? [];

          // Filter sort fields to exclude unsortable types
          const sortFields = schemaResponse.data.fields?.filter((field) => {
            if (field.sort !== true) return false;

            const unsortableTypes = [
              'string[]',
              'geopoint', 
              'object',
              'object[]',
              'auto',
            ];
            if (unsortableTypes.includes(field.type)) return false;

            return true;
          }) ?? [];

          setCollectionSchema(schemaResponse.data as CollectionSchema);
          setFacetFields(allFacetFields);
          setIndexFields(indexFields);

          // Set dropdown options
          const sortOptions = [{ label: 'Relevance', value: 'relevance' }];

          sortFields.forEach((field) => {
            const fieldName = field.name;
            const fieldType = field.type;
            const fieldLabel = fieldName.charAt(0).toUpperCase() + fieldName.slice(1);

            // For numeric fields, add both ascending and descending options
            if (['int32', 'int64', 'float', 'double'].includes(fieldType)) {
              sortOptions.push(
                {
                  label: `${fieldLabel} (Low to High)`,
                  value: `${fieldName}:asc`,
                },
                {
                  label: `${fieldLabel} (High to Low)`,
                  value: `${fieldName}:desc`,
                }
              );
            } else if (fieldType === 'bool') {
              sortOptions.push(
                {
                  label: `${fieldLabel} (False to True)`,
                  value: `${fieldName}:asc`,
                },
                {
                  label: `${fieldLabel} (True to False)`,
                  value: `${fieldName}:desc`,
                }
              );
            } else if (fieldType === 'string') {
              sortOptions.push(
                {
                  label: `${fieldLabel} (A-Z)`,
                  value: `${fieldName}:asc`,
                },
                {
                  label: `${fieldLabel} (Z-A)`,
                  value: `${fieldName}:desc`,
                }
              );
            } else {
              sortOptions.push(
                {
                  label: `${fieldLabel} (Ascending)`,
                  value: `${fieldName}:asc`,
                },
                {
                  label: `${fieldLabel} (Descending)`,
                  value: `${fieldName}:desc`,
                }
              );
            }
          });

          setSortDropdownOptions(sortOptions);
          setCountDropdownOptions([
            { label: '12 per page', value: 12 },
            { label: '24 per page', value: 24 },
            { label: '48 per page', value: 48 },
            { label: '96 per page', value: 96 },
          ]);
        }
      } catch (error) {
        console.error('Error fetching collection schema:', error);
        setError('Failed to load collection schema.');
      } finally {
        setLoading(false);
      }
    };

    if (collectionName) {
      fetchSchema();
    }
  }, [collectionName]);

  return {
    collectionSchema,
    indexFields,
    facetFields,
    sortDropdownOptions,
    countDropdownOptions,
    loading,
    error,
    setError,
  };
}