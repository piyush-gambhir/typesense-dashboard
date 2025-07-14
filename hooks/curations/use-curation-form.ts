import { useState, useCallback } from 'react';
import { CurationOverride } from './use-search-overrides';

export interface CurationFormData {
  id: string;
  collection: string;
  query: string;
  match: 'exact' | 'contains';
  appliesTo: 'always' | 'on_match';
  forceInclude: Array<{ id: string; position?: number }>;
  forceExclude: Array<{ id: string }>;
  stopWords: string[];
  filterBy: string;
  sortBy: string;
}

export function useCurationForm(collectionName: string) {
  const [formData, setFormData] = useState<CurationFormData>({
    id: '',
    collection: collectionName,
    query: '',
    match: 'contains',
    appliesTo: 'always',
    forceInclude: [],
    forceExclude: [],
    stopWords: [],
    filterBy: '',
    sortBy: '',
  });

  // Input states for adding items
  const [forceIncludeInput, setForceIncludeInput] = useState('');
  const [forceIncludePosition, setForceIncludePosition] = useState('');
  const [forceExcludeInput, setForceExcludeInput] = useState('');
  const [stopWordInput, setStopWordInput] = useState('');

  const resetForm = useCallback(() => {
    setFormData({
      id: '',
      collection: collectionName,
      query: '',
      match: 'contains',
      appliesTo: 'always',
      forceInclude: [],
      forceExclude: [],
      stopWords: [],
      filterBy: '',
      sortBy: '',
    });
    setForceIncludeInput('');
    setForceIncludePosition('');
    setForceExcludeInput('');
    setStopWordInput('');
  }, [collectionName]);

  const loadOverrideData = useCallback((override: CurationOverride) => {
    setFormData({
      id: override.id,
      collection: override.collection_name,
      query: override.rule.query,
      match: override.rule.match || 'contains',
      appliesTo: override.applies_to,
      forceInclude: override.force_include || [],
      forceExclude: override.force_exclude || [],
      stopWords: override.stop_words || [],
      filterBy: override.filter_by || '',
      sortBy: override.sort_by || '',
    });
  }, []);

  const addForceInclude = useCallback(() => {
    if (forceIncludeInput.trim()) {
      const newInclude = {
        id: forceIncludeInput.trim(),
        ...(forceIncludePosition && {
          position: parseInt(forceIncludePosition),
        }),
      };
      setFormData(prev => ({
        ...prev,
        forceInclude: [...prev.forceInclude, newInclude],
      }));
      setForceIncludeInput('');
      setForceIncludePosition('');
    }
  }, [forceIncludeInput, forceIncludePosition]);

  const removeForceInclude = useCallback((index: number) => {
    setFormData(prev => ({
      ...prev,
      forceInclude: prev.forceInclude.filter((_, i) => i !== index),
    }));
  }, []);

  const addForceExclude = useCallback(() => {
    if (forceExcludeInput.trim()) {
      setFormData(prev => ({
        ...prev,
        forceExclude: [...prev.forceExclude, { id: forceExcludeInput.trim() }],
      }));
      setForceExcludeInput('');
    }
  }, [forceExcludeInput]);

  const removeForceExclude = useCallback((index: number) => {
    setFormData(prev => ({
      ...prev,
      forceExclude: prev.forceExclude.filter((_, i) => i !== index),
    }));
  }, []);

  const addStopWord = useCallback(() => {
    if (stopWordInput.trim()) {
      setFormData(prev => ({
        ...prev,
        stopWords: [...prev.stopWords, stopWordInput.trim()],
      }));
      setStopWordInput('');
    }
  }, [stopWordInput]);

  const removeStopWord = useCallback((index: number) => {
    setFormData(prev => ({
      ...prev,
      stopWords: prev.stopWords.filter((_, i) => i !== index),
    }));
  }, []);

  const updateFormData = useCallback((updates: Partial<CurationFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  }, []);

  const buildOverrideData = useCallback(() => {
    return {
      id: formData.id,
      rule: {
        query: formData.query,
        match: formData.match,
        applies_to: formData.appliesTo,
        ...(formData.forceInclude.length > 0 && {
          include: formData.forceInclude,
        }),
        ...(formData.forceExclude.length > 0 && {
          exclude: formData.forceExclude,
        }),
        ...(formData.stopWords.length > 0 && {
          stop_words: formData.stopWords,
        }),
        ...(formData.filterBy && { filter_by: formData.filterBy }),
        ...(formData.sortBy && { sort_by: formData.sortBy }),
      },
    };
  }, [formData]);

  const isFormValid = useCallback(() => {
    return formData.id.trim() !== '' && formData.query.trim() !== '';
  }, [formData.id, formData.query]);

  return {
    formData,
    forceIncludeInput,
    forceIncludePosition,
    forceExcludeInput,
    stopWordInput,
    setForceIncludeInput,
    setForceIncludePosition,
    setForceExcludeInput,
    setStopWordInput,
    resetForm,
    loadOverrideData,
    addForceInclude,
    removeForceInclude,
    addForceExclude,
    removeForceExclude,
    addStopWord,
    removeStopWord,
    updateFormData,
    buildOverrideData,
    isFormValid,
  };
}