import { useState, useEffect, useCallback } from 'react';
import {
  type SearchOverride,
  createSearchOverride,
  deleteSearchOverride,
  listSearchOverrides,
  updateSearchOverride,
  validateOverrideData,
} from '@/lib/typesense/search-overrides';
import { getCollections } from '@/lib/typesense/collections';
import { useToastNotification } from '@/hooks/shared/use-toast-notification';

export interface GlobalOverride extends SearchOverride {
  collection_name: string;
}

export function useGlobalSearchOverrides() {
  const [overrides, setOverrides] = useState<GlobalOverride[]>([]);
  const [collections, setCollections] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { showSuccess, showError } = useToastNotification();

  const fetchCollections = useCallback(async () => {
    try {
      const fetchedCollections = await getCollections();
      if (fetchedCollections?.success && fetchedCollections?.data) {
        const collectionNames = fetchedCollections.data.map((col: any) => col.name);
        setCollections(collectionNames);
      }
    } catch (error) {
      showError('Failed to load collections.');
    }
  }, [showError]);

  const fetchOverrides = useCallback(async () => {
    try {
      setLoading(true);
      const fetchedOverrides = await listSearchOverrides();
      if (fetchedOverrides) {
        setOverrides(fetchedOverrides);
      }
    } catch (error) {
      showError('Failed to load search presets.');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchCollections(), fetchOverrides()]);
    };
    loadData();
  }, [fetchCollections, fetchOverrides]);

  const createOverride = useCallback(async (collectionName: string, overrideData: any) => {
    const validation = validateOverrideData(overrideData);
    if (!validation.valid) {
      showError(validation.errors.join(', '), 'Validation Error');
      return false;
    }

    try {
      const result = await createSearchOverride(
        collectionName,
        `preset_${Date.now()}`,
        overrideData
      );
      if (result) {
        showSuccess('Search preset created successfully.');
        await fetchOverrides();
        return true;
      }
      throw new Error('Failed to create search preset');
    } catch (error) {
      showError(
        error instanceof Error ? error.message : 'Failed to create search preset'
      );
      return false;
    }
  }, [showSuccess, showError, fetchOverrides]);

  const updateOverride = useCallback(async (collectionName: string, id: string, overrideData: any) => {
    const validation = validateOverrideData(overrideData);
    if (!validation.valid) {
      showError(validation.errors.join(', '), 'Validation Error');
      return false;
    }

    try {
      const result = await updateSearchOverride(collectionName, id, overrideData);
      if (result) {
        showSuccess('Search preset updated successfully.');
        await fetchOverrides();
        return true;
      }
      throw new Error('Failed to update search preset');
    } catch (error) {
      showError(
        error instanceof Error ? error.message : 'Failed to update search preset'
      );
      return false;
    }
  }, [showSuccess, showError, fetchOverrides]);

  const deleteOverride = useCallback(async (collectionName: string, id: string) => {
    try {
      const result = await deleteSearchOverride(collectionName, id);
      if (result) {
        showSuccess('Search preset deleted successfully.');
        await fetchOverrides();
        return true;
      }
      throw new Error('Failed to delete search preset');
    } catch (error) {
      showError(
        error instanceof Error ? error.message : 'Failed to delete search preset'
      );
      return false;
    }
  }, [showSuccess, showError, fetchOverrides]);

  return {
    overrides,
    collections,
    loading,
    createOverride,
    updateOverride,
    deleteOverride,
    refetch: fetchOverrides,
  };
}