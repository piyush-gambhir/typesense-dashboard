import { useState, useEffect, useCallback } from 'react';
import { multiSearch } from '@/lib/typesense/documents';
import { CollectionSchema } from './use-collection-schema';

export interface FacetValue {
  value: string | number | boolean;
  count: number;
}

export function useFacetManagement(
  collectionName: string,
  collectionSchema: CollectionSchema | null,
  facetFields: string[],
  indexFields: string[],
  searchQuery: string,
  filterBy: string[]
) {
  const [facetValues, setFacetValues] = useState<Record<string, FacetValue[]>>({});
  const [loading, setLoading] = useState(true);

  const addBooleanFacets = useCallback(() => {
    if (!collectionSchema?.fields) return;

    const booleanFacets: Record<string, FacetValue[]> = {};

    const booleanFields = (
      Array.isArray(collectionSchema.fields) ? collectionSchema.fields : []
    ).filter((field) => field.facet === true && field.type === 'bool');

    booleanFields.forEach((field) => {
      booleanFacets[field.name] = [
        { value: true, count: 0 },
        { value: false, count: 0 },
      ];
    });

    setFacetValues((prev) => ({ ...prev, ...booleanFacets }));
  }, [collectionSchema]);

  const addIntFieldFallbacks = useCallback((
    existingFacetValues: Record<string, FacetValue[]>
  ) => {
    if (!collectionSchema?.fields) return;

    const intFields = (
      Array.isArray(collectionSchema.fields) ? collectionSchema.fields : []
    ).filter(
      (field) =>
        field.facet === true &&
        ['int32', 'int64', 'float', 'double'].includes(field.type) &&
        !existingFacetValues[field.name]
    );

    if (intFields.length > 0) {
      const intFieldFallbacks: Record<string, FacetValue[]> = {};
      
      intFields.forEach((field) => {
        const fieldType = field.type;
        let defaultValues: FacetValue[] = [];

        if (fieldType === 'int32' || fieldType === 'int64') {
          defaultValues = [
            { value: 0, count: 0 },
            { value: 1, count: 0 },
            { value: 10, count: 0 },
            { value: 100, count: 0 },
          ];
        } else if (fieldType === 'float' || fieldType === 'double') {
          defaultValues = [
            { value: 0.0, count: 0 },
            { value: 1.0, count: 0 },
            { value: 10.0, count: 0 },
            { value: 100.0, count: 0 },
          ];
        }

        intFieldFallbacks[field.name] = defaultValues;
      });

      setFacetValues((prev) => ({ ...prev, ...intFieldFallbacks }));
    }
  }, [collectionSchema]);

  const fetchFacets = useCallback(async () => {
    setLoading(true);
    
    try {
      if (facetFields.length === 0) {
        setFacetValues({});
        addBooleanFacets();
        addIntFieldFallbacks({});
        setLoading(false);
        return;
      }

      // Build filter string for facets
      const validFilters = filterBy.filter((filter) => {
        if (!filter || filter.trim() === '') return false;
        if (!filter.includes(':=')) {
          console.warn('[fetchFacets] Invalid filter format:', filter);
          return false;
        }
        return true;
      });

      const filterString = validFilters.join(' && ');

      const baseQuery = {
        collection: collectionName,
        q: searchQuery || '*',
        queryBy: indexFields.length > 0 ? indexFields.join(',') : '*',
        maxFacetValues: 100,
        perPage: 0,
        filterBy: filterString,
      };

      const queries = [
        {
          ...baseQuery,
          facetBy: facetFields.join(','),
        },
      ];

      const response = await multiSearch({ searchQueries: queries });

      if (
        response &&
        response.results &&
        Array.isArray(response.results) &&
        response.results.length > 0
      ) {
        const documentsResponse = response.results[0];
        
        if (documentsResponse && documentsResponse.facet_counts) {
          type FacetCount = {
            field_name: string;
            counts: Array<{ value: string; count: number }>;
          };

          const facetCounts = documentsResponse.facet_counts as FacetCount[];

          const newFacetValues = facetCounts.reduce(
            (acc: Record<string, FacetValue[]>, facet: FacetCount) => {
              acc[facet.field_name] = facet.counts?.map((count) => {
                let parsedValue: string | number | boolean = count.value;
                if (count.value === 'true') {
                  parsedValue = true;
                } else if (count.value === 'false') {
                  parsedValue = false;
                } else if (!isNaN(Number(count.value)) && count.value !== '') {
                  parsedValue = Number(count.value);
                }

                return {
                  value: parsedValue,
                  count: count.count,
                };
              }) ?? [];
              return acc;
            },
            {} as Record<string, FacetValue[]>
          );

          setFacetValues((prev) => {
            const merged = { ...prev, ...newFacetValues };
            return merged;
          });

          addBooleanFacets();
          addIntFieldFallbacks(newFacetValues);
        } else {
          setFacetValues({});
          addBooleanFacets();
          addIntFieldFallbacks({});
        }
      } else {
        setFacetValues({});
        addBooleanFacets();
        addIntFieldFallbacks({});
      }
    } catch (error) {
      console.error('Error fetching facet values:', error);
      setFacetValues({});
      addBooleanFacets();
      addIntFieldFallbacks({});
    } finally {
      setLoading(false);
    }
  }, [
    facetFields,
    collectionName,
    searchQuery,
    filterBy,
    indexFields,
    addBooleanFacets,
    addIntFieldFallbacks,
  ]);

  useEffect(() => {
    if (facetFields.length > 0) {
      fetchFacets();
    } else {
      setLoading(false);
      setFacetValues({});
    }
  }, [fetchFacets]);

  return {
    facetValues,
    loading,
    refetch: fetchFacets,
  };
}