import { useEffect, useState } from 'react';

import { getCollection } from '@/lib/typesense/collections';
import { multiSearch } from '@/lib/typesense/documents';

interface FacetValue {
  value: string;
  count: number;
}

export const useCollectionSearchOptions = ({
  collectionName,
}: {
  collectionName: string;
}) => {
  const [facetValues, setFacetValues] = useState<Record<string, FacetValue[]>>(
    {},
  );
  const [loadingFilters, setLoadingFilters] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [sortFields, setSortFields] = useState<
    { label: string; value: string }[]
  >([]);
  const [perPageOptions] = useState<number[]>([10, 20, 50, 100]);

  useEffect(() => {
    const fetchSchema = async () => {
      try {
        const schemaResponse = await getCollection(collectionName);

        if (schemaResponse?.success && schemaResponse.data?.fields) {
          // Filter for sort fields
          const sortFields = schemaResponse.data.fields
            .filter((field: any) => field.sort === true)
            .map((field: any) => ({
              label: `${field.name} (Ascending)`,
              value: `${field.name}:asc`,
            }))
            .concat(
              schemaResponse.data.fields
                .filter((field: any) => field.sort === true)
                .map((field: any) => ({
                  label: `${field.name} (Descending)`,
                  value: `${field.name}:desc`,
                })),
            );
          setSortFields(sortFields);

          // Filter for facet fields
          const facetFields = schemaResponse.data.fields
            .filter((field: any) => field.facet === true)
            .map((field: any) => field.name);

          if (facetFields.length > 0) {
            fetchFacets(facetFields);
          }
        }
      } catch (error) {
        console.error('Error fetching schema:', error);
        setError('Error fetching schema');
      }
    };

    const fetchFacets = async (facetFields: string[]) => {
      setLoadingFilters(true);
      try {
        const queries = [
          {
            collection: collectionName,
            q: '*',
            facetBy: facetFields.join(','),
            maxFacetValues: 10,
            perPage: 0,
          },
        ];

        const response = await multiSearch({
          searchQueries: queries,
        });

        if (response && response.results && Array.isArray(response.results) && response.results.length > 0) {
          const documentsResponse = response.results[0];
          if (documentsResponse) {
            setFacetValues(
              (documentsResponse as any)?.facets?.reduce(
                (acc: Record<string, FacetValue[]>, facet: any) => {
                  acc[facet.field_name] =
                    facet.counts?.map((count: any) => ({
                      value: count.value,
                      count: count.count,
                    })) ?? [];
                  return acc;
                },
                {},
              ) ?? {},
            );
          }
        }
      } catch (error) {
        console.error('Error fetching facet values:', error);
        setError('Error fetching filters');
      } finally {
        setLoadingFilters(false);
      }
    };

    fetchSchema();
  }, [collectionName]);

  return {
    facetValues,
    loadingFilters,
    error,
    sortFields,
    perPageOptions,
  };
};
