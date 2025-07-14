import { useState, useEffect, useCallback } from 'react';
import {
  type SearchOverride,
  createSearchOverride,
  deleteSearchOverride,
  listSearchOverrides,
  updateSearchOverride,
  validateOverrideData,
} from '@/lib/typesense/search-overrides';
import { useToastNotification } from '@/hooks/shared/use-toast-notification';

export interface CurationOverride extends SearchOverride {
  collection_name: string;
}

export function useSearchOverrides(collectionName: string) {
  const [overrides, setOverrides] = useState<CurationOverride[]>([]);
  const [loading, setLoading] = useState(true);
  const { showSuccess, showError } = useToastNotification();

  const fetchOverrides = useCallback(async () => {
    try {
      setLoading(true);
      const fetchedOverrides = await listSearchOverrides();
      if (fetchedOverrides) {
        const collectionOverrides = fetchedOverrides.filter(
          (override: any) => override.collection_name === collectionName
        );
        setOverrides(collectionOverrides);
      }
    } catch (error) {
      showError('Failed to load search curations.');
    } finally {
      setLoading(false);
    }
  }, [collectionName, showError]);

  useEffect(() => {
    if (collectionName) {
      fetchOverrides();
    }
  }, [collectionName, fetchOverrides]);

  const createOverride = useCallback(async (overrideData: any) => {
    const validation = validateOverrideData(overrideData);
    if (!validation.valid) {
      showError(validation.errors.join(', '), 'Validation Error');
      return false;
    }

    try {
      const result = await createSearchOverride(
        collectionName,
        `override_${Date.now()}`,
        overrideData
      );
      if (result) {
        showSuccess('Search curation created successfully.');
        await fetchOverrides();
        return true;
      }
      throw new Error('Failed to create search curation');
    } catch (error) {
      showError(
        error instanceof Error ? error.message : 'Failed to create search curation'
      );
      return false;
    }
  }, [collectionName, showSuccess, showError, fetchOverrides]);

  const updateOverride = useCallback(async (id: string, overrideData: any) => {
    const validation = validateOverrideData(overrideData);
    if (!validation.valid) {
      showError(validation.errors.join(', '), 'Validation Error');
      return false;
    }

    try {
      const result = await updateSearchOverride(collectionName, id, overrideData);
      if (result) {
        showSuccess('Search curation updated successfully.');
        await fetchOverrides();
        return true;
      }
      throw new Error('Failed to update search curation');
    } catch (error) {
      showError(
        error instanceof Error ? error.message : 'Failed to update search curation'
      );
      return false;
    }
  }, [collectionName, showSuccess, showError, fetchOverrides]);

  const deleteOverride = useCallback(async (id: string) => {
    try {
      const result = await deleteSearchOverride(collectionName, id);
      if (result) {
        showSuccess('Search curation deleted successfully.');
        await fetchOverrides();
        return true;
      }
      throw new Error('Failed to delete search curation');
    } catch (error) {
      showError(
        error instanceof Error ? error.message : 'Failed to delete search curation'
      );
      return false;
    }
  }, [collectionName, showSuccess, showError, fetchOverrides]);

  return {
    overrides,
    loading,
    createOverride,
    updateOverride,
    deleteOverride,
    refetch: fetchOverrides,
  };
}