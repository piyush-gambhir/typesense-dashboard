'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';

import { getCollection } from '@/lib/typesense/collections';
import { deleteDocument, multiSearch } from '@/lib/typesense/documents';

import { useDebounce } from '@/hooks/useDebounce';
import useQueryParams from '@/hooks/useQueryParams';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

import PaginationComponent from '@/components/common/Pagination';
import DocumentCard from '@/components/features/documents/DocumentCard';
import FacetDebugger from '@/components/features/search/FacetDebugger';
import Filter from '@/components/features/search/SearchFilters';
import SearchSkeleton from '@/components/features/search/SearchSkeleton';

interface FacetValue {
    value: string | number | boolean;
    count: number;
}

interface SearchResult {
    id: string;
    [key: string]: unknown;
}

interface TypesenseSearchProps {
    collectionName: string;
}

interface CollectionSchema {
    fields: { name: string; type: string; facet: boolean; sort?: boolean }[];
}

export default function TypesenseSearch({
    collectionName,
}: Readonly<TypesenseSearchProps>) {
    const { queryParams, setQueryParams } = useQueryParams();

    const [collectionSchema, setCollectionSchema] =
        useState<CollectionSchema | null>(null);
    const [indexFields, setIndexFields] = useState<string[]>([]);
    const [facetFields, setFacetFields] = useState<string[]>([]);

    // Initialize state from URL params
    const [searchQuery, setSearchQuery] = useState<string>(
        Array.isArray(queryParams.q)
            ? queryParams.q[0] || ''
            : queryParams.q || '',
    );
    const [perPage, setPerPage] = useState<number>(
        parseInt(
            Array.isArray(queryParams.perPage)
                ? queryParams.perPage[0] || '12'
                : queryParams.perPage || '12',
        ),
    );
    const [currentPage, setCurrentPage] = useState<number>(
        parseInt(
            Array.isArray(queryParams.page)
                ? queryParams.page[0] || '1'
                : queryParams.page || '1',
        ),
    );
    const [sortBy, setSortBy] = useState<string>(
        Array.isArray(queryParams.sortBy)
            ? queryParams.sortBy[0] || 'relevance'
            : queryParams.sortBy || 'relevance',
    );

    // Handle filter_by parameter properly
    const getFilterByFromParams = useCallback((): string[] => {
        const filterByParam = queryParams.filter_by;
        let filters: string[] = [];

        if (Array.isArray(filterByParam)) {
            filters = filterByParam;
        } else if (
            typeof filterByParam === 'string' &&
            filterByParam.trim() !== ''
        ) {
            // Split by comma but be careful about commas within filter values
            // For now, use simple split - could be enhanced later for complex cases
            filters = filterByParam
                .split(',')
                .filter(Boolean)
                .map((f) => f.trim());
        }

        // Convert any old format boolean filters to new format and validate
        const convertedFilters = filters
            .map((filter) => {
                if (!filter || filter.trim() === '') return null;

                if (filter.includes(':') && !filter.includes(':=')) {
                    // This is an old format boolean filter like "is_sold:true"
                    const colonIndex = filter.indexOf(':');
                    const field = filter.substring(0, colonIndex);
                    const value = filter.substring(colonIndex + 1);
                    return `${field}:=${value}`;
                }
                return filter;
            })
            .filter((filter): filter is string => filter !== null);

        console.log('[getFilterByFromParams] Original filters:', filters);
        console.log(
            '[getFilterByFromParams] Converted filters:',
            convertedFilters,
        );

        return convertedFilters;
    }, [queryParams.filter_by]);

    const [filterBy, setFilterBy] = useState<string[]>(getFilterByFromParams());
    const [facetValues, setFacetValues] = useState<
        Record<string, FacetValue[]>
    >({});

    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [loadingDocuments, setLoadingDocuments] = useState<boolean>(true);
    const [loadingFilters, setLoadingFilters] = useState<boolean>(true);
    const [isInitialLoad, setIsInitialLoad] = useState<boolean>(true);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [totalResults, setTotalResults] = useState<number>(0);
    const [error, setError] = useState<string | null>(null);

    const debouncedSearchQuery = useDebounce<string>(searchQuery, 300);
    const debouncedFilterBy = useDebounce<string[]>(filterBy, 500);

    const [sortDropdownOptions, setSortDropdownOptions] = useState<
        { label: string; value: string }[]
    >([]);
    const [countDropdownOptions, setCountDropdownOptions] = useState<
        { label: string; value: number }[]
    >([]);
    const [showFacetDebugger, setShowFacetDebugger] = useState<boolean>(false);

    // Ref to prevent infinite loops
    const isSearching = useRef(false);

    // Update local state when URL params change (only on mount and when URL changes externally)
    useEffect(() => {
        const newSearchQuery = Array.isArray(queryParams.q)
            ? queryParams.q[0] || ''
            : queryParams.q || '';
        const newPerPage = parseInt(
            Array.isArray(queryParams.perPage)
                ? queryParams.perPage[0] || '12'
                : queryParams.perPage || '12',
        );
        const newCurrentPage = parseInt(
            Array.isArray(queryParams.page)
                ? queryParams.page[0] || '1'
                : queryParams.page || '1',
        );
        let newSortBy = Array.isArray(queryParams.sortBy)
            ? queryParams.sortBy[0] || 'relevance'
            : queryParams.sortBy || 'relevance';

        // Validate sort value against available options (only if options are loaded)
        if (sortDropdownOptions.length > 0) {
            const isValidSort =
                newSortBy === 'relevance' ||
                sortDropdownOptions.some(
                    (option) => option.value === newSortBy,
                );
            if (!isValidSort) {
                console.warn(
                    '[URL params] Invalid sort value from URL:',
                    newSortBy,
                    'Resetting to relevance',
                );
                newSortBy = 'relevance';
            }
        }
        const newFilterBy = getFilterByFromParams();

        // Only update state if values have actually changed to prevent unnecessary re-renders
        if (newSearchQuery !== searchQuery) {
            setSearchQuery(newSearchQuery);
        }
        if (newPerPage !== perPage) {
            setPerPage(newPerPage);
        }
        if (newCurrentPage !== currentPage) {
            setCurrentPage(newCurrentPage);
        }
        if (newSortBy !== sortBy) {
            setSortBy(newSortBy);
        }
        if (JSON.stringify(newFilterBy) !== JSON.stringify(filterBy)) {
            setFilterBy(newFilterBy);
        }
    }, [
        queryParams.q,
        queryParams.perPage,
        queryParams.page,
        queryParams.sortBy,
        queryParams.filter_by,
        sortDropdownOptions,
    ]);

    // Update URL when search query changes
    useEffect(() => {
        const currentQuery = Array.isArray(queryParams.q)
            ? queryParams.q[0] || ''
            : queryParams.q || '';
        if (debouncedSearchQuery !== currentQuery) {
            const newParams = { ...queryParams };
            if (debouncedSearchQuery) {
                newParams.q = debouncedSearchQuery;
            } else {
                delete newParams.q;
            }
            newParams.page = '1';
            setQueryParams(newParams);
        }
    }, [debouncedSearchQuery]);

    // Update URL when filters change
    useEffect(() => {
        const currentFilterBy = getFilterByFromParams();
        if (
            JSON.stringify(debouncedFilterBy) !==
            JSON.stringify(currentFilterBy)
        ) {
            const newParams = { ...queryParams };
            if (debouncedFilterBy.length > 0) {
                newParams.filter_by = debouncedFilterBy.join(',');
            } else {
                delete newParams.filter_by;
            }
            newParams.page = '1';
            setQueryParams(newParams);
        }
    }, [debouncedFilterBy, getFilterByFromParams]);

    const performMultiSearch = async () => {
        if (isSearching.current) return; // Prevent concurrent searches

        isSearching.current = true;
        if (!isInitialLoad) {
            setLoadingDocuments(true);
        }
        setError(null); // Clear any previous errors

        // Validate required fields
        if (indexFields.length === 0) {
            console.warn(
                '[performMultiSearch] No string index fields available for search',
            );
            setSearchResults([]);
            setTotalResults(0);
            setTotalPages(1);
            setLoadingDocuments(false);
            setIsInitialLoad(false);
            isSearching.current = false;
            return;
        }

        // Build filter string properly - only include non-empty filters
        const validFilters = debouncedFilterBy.filter((filter) => {
            if (!filter || filter.trim() === '') return false;

            // Validate filter format - should be field:=value
            if (!filter.includes(':=')) {
                console.warn(
                    '[performMultiSearch] Invalid filter format:',
                    filter,
                );
                return false;
            }

            return true;
        });

        const filterString = validFilters.join(' && ');

        console.log('[performMultiSearch] Raw filters:', debouncedFilterBy);
        console.log('[performMultiSearch] Valid filters:', validFilters);
        console.log('[performMultiSearch] Filter string:', filterString);

        const queries = [
            {
                collection: collectionName,
                q: searchQuery || '*',
                queryBy: indexFields.length > 0 ? indexFields.join(',') : '*',
                highlightFullFields:
                    indexFields.length > 0 ? indexFields.join(',') : '',
                page: currentPage,
                perPage,
                exhaustiveSearch: true,
                sortBy: sortBy === 'relevance' ? '' : sortBy,
                filterBy: filterString,
            },
        ];

        console.log('[performMultiSearch] queries:', queries);

        try {
            const response = await multiSearch({
                searchQueries: queries,
            });

            console.log('[performMultiSearch] response:', response);

            if (
                response &&
                response.results &&
                Array.isArray(response.results) &&
                response.results.length > 0
            ) {
                const documentsResponse = response.results[0];
                console.log(
                    '[performMultiSearch] documentsResponse:',
                    documentsResponse,
                );
                if (documentsResponse) {
                    type SearchHit = {
                        document: Record<string, unknown>;
                    };
                    type SearchResponse = {
                        hits?: SearchHit[];
                        found?: number;
                    };
                    const typedResponse = documentsResponse as SearchResponse;

                    setSearchResults(
                        typedResponse.hits?.map(
                            (hit) => hit.document as SearchResult,
                        ) ?? [],
                    );
                    setTotalResults(typedResponse.found ?? 0);
                    const totalPages = Math.ceil(
                        (typedResponse.found ?? 0) / perPage,
                    );
                    setTotalPages(totalPages);
                } else {
                    setSearchResults([]);
                    setTotalResults(0);
                    setTotalPages(1);
                }
            } else {
                console.error(
                    '[performMultiSearch] response.results is missing or empty:',
                    response?.results,
                );
                setSearchResults([]);
                setTotalResults(0);
                setTotalPages(1);
            }
        } catch (error) {
            console.error('Error performing multi-search:', error);
            setError('Failed to perform search. Please try again.');
            setSearchResults([]);
            setTotalResults(0);
            setTotalPages(1);
        } finally {
            setLoadingDocuments(false);
            setIsInitialLoad(false);
            isSearching.current = false;
        }
    };

    useEffect(() => {
        const fetchFacets = async () => {
            setLoadingFilters(true);
            try {
                // Only fetch facets if we have facet fields
                if (facetFields.length === 0) {
                    setFacetValues({});
                    setLoadingFilters(false);
                    return;
                }

                // Create a more robust facet query that ensures all facet fields are included
                const baseQuery = {
                    collection: collectionName,
                    q: '*',
                    queryBy: '*', // Use * to ensure we get all documents for facet counting
                    maxFacetValues: 100, // Increase max facet values to get more options
                    perPage: 0,
                };

                // Always include facetBy if we have any facet fields
                const queries = [
                    {
                        ...baseQuery,
                        facetBy: facetFields.join(','),
                    },
                ];

                console.log('[fetchFacets] Debug info:', {
                    facetFields,
                    facetByString: facetFields.join(','),
                    query: queries[0],
                    // Add specific debugging for int fields
                    intFields: facetFields.filter((field) => {
                        const fieldInfo = collectionSchema?.fields?.find(
                            (f) => f.name === field,
                        );
                        return (
                            fieldInfo &&
                            ['int32', 'int64', 'float', 'double'].includes(
                                fieldInfo.type,
                            )
                        );
                    }),
                });

                const response = await multiSearch({
                    searchQueries: queries,
                });

                console.log('[fetchFacets] response:', response);

                if (
                    response &&
                    response.results &&
                    Array.isArray(response.results) &&
                    response.results.length > 0
                ) {
                    const documentsResponse = response.results[0];
                    console.log(
                        '[fetchFacets] documentsResponse:',
                        documentsResponse,
                    );
                    if (documentsResponse && documentsResponse.facet_counts) {
                        type FacetCount = {
                            field_name: string;
                            counts: Array<{
                                value: string;
                                count: number;
                            }>;
                        };

                        const facetCounts =
                            documentsResponse.facet_counts as FacetCount[];

                        // Add debugging for facet counts
                        console.log('[fetchFacets] facet_counts:', facetCounts);

                        const newFacetValues = facetCounts.reduce(
                            (
                                acc: Record<string, FacetValue[]>,
                                facet: FacetCount,
                            ) => {
                                // Add debugging for each facet field
                                const fieldInfo =
                                    collectionSchema?.fields?.find(
                                        (f) => f.name === facet.field_name,
                                    );
                                console.log(
                                    `[fetchFacets] Processing facet field: ${facet.field_name}`,
                                    {
                                        fieldType: fieldInfo?.type,
                                        counts: facet.counts,
                                        isIntField:
                                            fieldInfo &&
                                            [
                                                'int32',
                                                'int64',
                                                'float',
                                                'double',
                                            ].includes(fieldInfo.type),
                                    },
                                );

                                acc[facet.field_name] =
                                    facet.counts?.map((count) => {
                                        // Convert string values to appropriate types for boolean fields
                                        let parsedValue:
                                            | string
                                            | number
                                            | boolean = count.value;
                                        if (count.value === 'true') {
                                            parsedValue = true;
                                        } else if (count.value === 'false') {
                                            parsedValue = false;
                                        } else if (
                                            !isNaN(Number(count.value)) &&
                                            count.value !== ''
                                        ) {
                                            parsedValue = Number(count.value);
                                        }

                                        return {
                                            value: parsedValue,
                                            count: count.count,
                                        };
                                    }) ?? [];
                                return acc;
                            },
                            {} as Record<string, FacetValue[]>,
                        );

                        console.log(
                            '[fetchFacets] Processed facet values:',
                            newFacetValues,
                        );

                        // Merge with existing facet values to preserve any manually added ones
                        setFacetValues((prev) => {
                            const merged = { ...prev, ...newFacetValues };
                            console.log(
                                '[fetchFacets] Merged facet values:',
                                merged,
                            );
                            return merged;
                        });

                        // Add boolean facets separately
                        addBooleanFacets();

                        // Add fallback for int fields that might not have facet values
                        addIntFieldFallbacks(newFacetValues);
                    } else {
                        // No facet counts from API, but still add boolean facets
                        console.log(
                            '[fetchFacets] No facet_counts in response',
                        );
                        setFacetValues({});
                        addBooleanFacets();
                        addIntFieldFallbacks({});
                    }
                } else {
                    console.error(
                        '[fetchFacets] response.results is missing or empty:',
                        response?.results,
                    );
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
                setLoadingFilters(false);
            }
        };

        const addBooleanFacets = () => {
            if (!collectionSchema?.fields) return;

            const booleanFacets: Record<string, FacetValue[]> = {};

            const booleanFields = (
                Array.isArray(collectionSchema.fields)
                    ? collectionSchema.fields
                    : []
            ).filter((field) => field.facet === true && field.type === 'bool');

            console.log(
                '[addBooleanFacets] Boolean fields found:',
                booleanFields.map((f) => f.name),
            );

            booleanFields.forEach((field) => {
                // Always provide both true and false options for boolean fields
                booleanFacets[field.name] = [
                    { value: true, count: 0 },
                    { value: false, count: 0 },
                ];
            });

            console.log(
                '[addBooleanFacets] Boolean facets to add:',
                booleanFacets,
            );
            setFacetValues((prev) => {
                const merged = { ...prev, ...booleanFacets };
                console.log('[addBooleanFacets] Merged with existing:', merged);
                return merged;
            });
        };

        const addIntFieldFallbacks = (
            existingFacetValues: Record<string, FacetValue[]>,
        ) => {
            if (!collectionSchema?.fields) return;

            const intFields = (
                Array.isArray(collectionSchema.fields)
                    ? collectionSchema.fields
                    : []
            ).filter(
                (field) =>
                    field.facet === true &&
                    ['int32', 'int64', 'float', 'double'].includes(
                        field.type,
                    ) &&
                    !existingFacetValues[field.name],
            );

            console.log(
                '[addIntFieldFallbacks] Int fields without facet values:',
                intFields.map((f) => f.name),
            );

            if (intFields.length > 0) {
                const intFieldFallbacks: Record<string, FacetValue[]> = {};
                intFields.forEach((field) => {
                    // For integer fields, provide a range of common values
                    const fieldType = field.type;
                    let defaultValues: FacetValue[] = [];

                    if (fieldType === 'int32' || fieldType === 'int64') {
                        defaultValues = [
                            { value: 0, count: 0 },
                            { value: 1, count: 0 },
                            { value: 10, count: 0 },
                            { value: 100, count: 0 },
                        ];
                    } else if (
                        fieldType === 'float' ||
                        fieldType === 'double'
                    ) {
                        defaultValues = [
                            { value: 0.0, count: 0 },
                            { value: 1.0, count: 0 },
                            { value: 10.0, count: 0 },
                            { value: 100.0, count: 0 },
                        ];
                    }

                    intFieldFallbacks[field.name] = defaultValues;
                });

                console.log(
                    '[addIntFieldFallbacks] Adding fallback values:',
                    intFieldFallbacks,
                );
                setFacetValues((prev) => {
                    const merged = { ...prev, ...intFieldFallbacks };
                    console.log(
                        '[addIntFieldFallbacks] Merged with existing:',
                        merged,
                    );
                    return merged;
                });
            }
        };

        if (facetFields.length > 0) {
            fetchFacets();
        } else {
            setLoadingFilters(false);
            setFacetValues({});
        }
    }, [facetFields, collectionName, collectionSchema]);

    useEffect(() => {
        const fetchSchema = async () => {
            try {
                const schemaResponse = await getCollection(collectionName);

                // Handle the new collection data structure
                if (
                    schemaResponse?.success &&
                    schemaResponse?.data?.fields &&
                    Array.isArray(schemaResponse.data.fields)
                ) {
                    console.log(
                        '[fetchSchema] All fields:',
                        schemaResponse.data.fields.map((f) => ({
                            name: f.name,
                            type: f.type,
                            facet: f.facet,
                        })),
                    );

                    // Store all facetable fields for UI rendering
                    const allFacetFields =
                        schemaResponse.data.fields
                            ?.filter((field) => field.facet === true)
                            .map((field) => field.name) ?? [];

                    // For facet queries, include all facetable fields including booleans and integers
                    const facetFields = allFacetFields;

                    console.log('[fetchSchema] Filtered fields:', {
                        facetFields,
                        allFacetFields,
                        booleanFields: schemaResponse.data.fields
                            .filter((f) => f.type === 'bool' && f.facet)
                            .map((f) => f.name),
                    });

                    // Filter index fields to only include string and string[] types for query_by
                    const indexFields =
                        schemaResponse.data.fields
                            ?.filter(
                                (field) =>
                                    field.index === true &&
                                    (field.type === 'string' ||
                                        field.type === 'string[]'),
                            )
                            .map((field) => field.name) ?? [];

                    console.log(
                        '[fetchSchema] Index fields (string types only):',
                        indexFields,
                    );

                    // Filter sort fields to exclude unsortable types
                    const sortFields =
                        schemaResponse.data.fields?.filter((field) => {
                            // Only include fields that are explicitly marked as sortable
                            if (field.sort !== true) return false;

                            // Exclude certain field types that shouldn't be sortable
                            const unsortableTypes = [
                                'string[]',
                                'geopoint',
                                'object',
                                'object[]',
                                'auto',
                            ];
                            if (unsortableTypes.includes(field.type))
                                return false;

                            return true;
                        }) ?? [];

                    setCollectionSchema(
                        schemaResponse.data as CollectionSchema,
                    );
                    setFacetFields(allFacetFields); // Use all facet fields for UI
                    setIndexFields(indexFields);

                    // Set dropdown options - add sort direction for numeric fields
                    const sortOptions = [
                        { label: 'Relevance', value: 'relevance' },
                    ];

                    sortFields.forEach((field) => {
                        const fieldName = field.name;
                        const fieldType = field.type;
                        const fieldLabel =
                            fieldName.charAt(0).toUpperCase() +
                            fieldName.slice(1);

                        // For numeric fields, add both ascending and descending options
                        if (
                            ['int32', 'int64', 'float', 'double'].includes(
                                fieldType,
                            )
                        ) {
                            sortOptions.push(
                                {
                                    label: `${fieldLabel} (Low to High)`,
                                    value: `${fieldName}:asc`,
                                },
                                {
                                    label: `${fieldLabel} (High to Low)`,
                                    value: `${fieldName}:desc`,
                                },
                            );
                        } else if (fieldType === 'bool') {
                            // For boolean fields, add both ascending and descending options
                            sortOptions.push(
                                {
                                    label: `${fieldLabel} (False to True)`,
                                    value: `${fieldName}:asc`,
                                },
                                {
                                    label: `${fieldLabel} (True to False)`,
                                    value: `${fieldName}:desc`,
                                },
                            );
                        } else if (fieldType === 'string') {
                            // For string fields, add both ascending and descending options
                            sortOptions.push(
                                {
                                    label: `${fieldLabel} (A-Z)`,
                                    value: `${fieldName}:asc`,
                                },
                                {
                                    label: `${fieldLabel} (Z-A)`,
                                    value: `${fieldName}:desc`,
                                },
                            );
                        } else {
                            // For other supported types, add generic options
                            sortOptions.push(
                                {
                                    label: `${fieldLabel} (Ascending)`,
                                    value: `${fieldName}:asc`,
                                },
                                {
                                    label: `${fieldLabel} (Descending)`,
                                    value: `${fieldName}:desc`,
                                },
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
            }
        };

        fetchSchema();
    }, [collectionName]);

    // Perform search when dependencies change
    useEffect(() => {
        if (indexFields.length > 0 && !isInitialLoad) {
            performMultiSearch();
        }
    }, [
        debouncedSearchQuery,
        currentPage,
        perPage,
        sortBy,
        debouncedFilterBy,
        indexFields,
        isInitialLoad,
    ]);

    // Trigger initial search when schema is loaded
    useEffect(() => {
        if (indexFields.length > 0 && isInitialLoad) {
            performMultiSearch();
        }
    }, [indexFields, isInitialLoad]);

    const handleFilterChange = (
        field: string,
        value: string | boolean | number,
        checked: boolean,
    ) => {
        // Convert all values to strings for consistent filter format
        // Typesense expects string values even for boolean and number fields
        let stringValue: string;
        if (typeof value === 'boolean') {
            stringValue = value ? 'true' : 'false';
        } else if (typeof value === 'number') {
            stringValue = String(value);
        } else {
            stringValue = String(value);
        }

        // Use := for all field types to ensure proper string comparison
        const filterString = `${field}:=${stringValue}`;

        setFilterBy((prev) => {
            let newFilters: string[];

            if (checked) {
                // Add filter if not already present
                if (!prev.includes(filterString)) {
                    newFilters = [...prev, filterString];
                } else {
                    newFilters = prev;
                }
            } else {
                // Remove filter
                newFilters = prev.filter((item) => item !== filterString);
            }

            // Only update if the filters actually changed
            if (
                JSON.stringify(newFilters.sort()) !==
                JSON.stringify(prev.sort())
            ) {
                console.log('[handleFilterChange] Filters changed:', {
                    prev: prev,
                    new: newFilters,
                    checked: checked,
                    field: field,
                    value: value,
                });

                // Update URL immediately using proper hook functions
                if (newFilters.length > 0) {
                    const newParams = {
                        ...queryParams,
                        filter_by: newFilters.join(','),
                        page: '1',
                    };
                    console.log(
                        '[handleFilterChange] Setting params with filters:',
                        newParams,
                    );
                    setQueryParams(newParams);
                } else {
                    // Remove filter_by and reset page in one operation
                    const newParams: Record<string, string> = {
                        ...queryParams,
                        page: '1',
                    };
                    delete (newParams as any).filter_by;
                    console.log(
                        '[handleFilterChange] Setting params without filters:',
                        newParams,
                    );
                    setQueryParams(newParams);
                }

                return newFilters;
            }
            return prev;
        });
    };

    const handleClearFilters = () => {
        // Clear state
        setFilterBy([]);
        // Remove filter_by and reset page in one operation
        const newParams: Record<string, string> = { ...queryParams, page: '1' };
        delete (newParams as any).filter_by;
        setQueryParams(newParams);
        console.log(
            '[handleClearFilters] Cleared filters, new params:',
            newParams,
        );
    };

    const handlePerPageChange = (value: number) => {
        setQueryParams({
            ...queryParams,
            perPage: String(value),
            page: '1',
        });
        setPerPage(value);
        setCurrentPage(1);
    };

    const handleSortByChange = (value: string) => {
        // Validate sort value against available options
        const isValidSort =
            value === 'relevance' ||
            sortDropdownOptions.some((option) => option.value === value);

        if (isValidSort) {
            setQueryParams({ ...queryParams, sortBy: value, page: '1' });
            setSortBy(value);
            setCurrentPage(1);
        } else {
            console.warn('[handleSortByChange] Invalid sort value:', value);
            // Reset to relevance if invalid
            setQueryParams({ ...queryParams, sortBy: 'relevance', page: '1' });
            setSortBy('relevance');
            setCurrentPage(1);
        }
    };

    const handlePageChange = (page: number) => {
        setQueryParams({ ...queryParams, page: String(page) });
        setCurrentPage(page);
    };

    const handleDeleteDocument = async (documentId: string) => {
        try {
            await deleteDocument(collectionName, documentId);
            // Refresh the search results after deletion
            performMultiSearch();
        } catch (error) {
            console.error('Error deleting document:', error);
        }
    };

    // Validate collection name
    if (!collectionName || typeof collectionName !== 'string') {
        return (
            <div className="p-8">
                <Alert>
                    <AlertDescription>
                        Invalid collection name provided.
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    // Show skeleton on initial load
    if (isInitialLoad && (loadingDocuments || loadingFilters)) {
        return <SearchSkeleton />;
    }

    return (
        <div className="p-4 md:p-8 flex flex-col gap-y-4">
            <Card className="border-none shadow-none">
                <CardContent>
                    {error && (
                        <Alert className="mb-4">
                            <AlertDescription className="flex items-center justify-between">
                                <span>{error}</span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setError(null);
                                        performMultiSearch();
                                    }}
                                >
                                    Retry
                                </Button>
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Search Bar */}
                    <div className="mb-6">
                        <div className="flex gap-2">
                            <Input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search documents..."
                                className="flex-1"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-12">
                        <div className="col-span-1">
                            {loadingFilters ? (
                                <div className="space-y-6">
                                    {[1, 2, 3].map((i) => (
                                        <div
                                            key={i}
                                            className="border-b last:border-b-0 pb-4"
                                        >
                                            <div className="h-6 w-32 mb-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                                            <div className="space-y-3">
                                                {[1, 2, 3, 4].map((j) => (
                                                    <div
                                                        key={j}
                                                        className="flex items-center space-x-2"
                                                    >
                                                        <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                                                        <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                                                        <div className="h-4 w-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <Filter
                                    collectionSchema={collectionSchema}
                                    facetValues={facetValues}
                                    singleColumn={true}
                                    filterBy={(() => {
                                        const filterMap: Record<
                                            string,
                                            (string | number | boolean)[]
                                        > = {};
                                        filterBy.forEach((filter) => {
                                            if (filter) {
                                                let field: string,
                                                    value: string;

                                                // Now all filters use the := format
                                                if (filter.includes(':=')) {
                                                    // Use indexOf to find the first occurrence and split properly
                                                    const separatorIndex =
                                                        filter.indexOf(':=');
                                                    field = filter.substring(
                                                        0,
                                                        separatorIndex,
                                                    );
                                                    value = filter.substring(
                                                        separatorIndex + 2,
                                                    );
                                                } else {
                                                    return; // Skip invalid filters
                                                }

                                                if (
                                                    field &&
                                                    value !== undefined
                                                ) {
                                                    // Convert string values back to their original types
                                                    let parsedValue:
                                                        | string
                                                        | number
                                                        | boolean;
                                                    if (value === 'true') {
                                                        parsedValue = true;
                                                    } else if (
                                                        value === 'false'
                                                    ) {
                                                        parsedValue = false;
                                                    } else if (
                                                        !isNaN(Number(value)) &&
                                                        value !== '' &&
                                                        value !== 'null'
                                                    ) {
                                                        parsedValue =
                                                            Number(value);
                                                    } else {
                                                        parsedValue = value;
                                                    }

                                                    if (!filterMap[field]) {
                                                        filterMap[field] = [];
                                                    }
                                                    filterMap[field].push(
                                                        parsedValue,
                                                    );
                                                }
                                            }
                                        });
                                        return filterMap;
                                    })()}
                                    onFilterChange={(
                                        field: string,
                                        value: string | number | boolean,
                                        checked: boolean,
                                    ) => {
                                        handleFilterChange(
                                            field,
                                            typeof value === 'boolean'
                                                ? value
                                                : String(value),
                                            checked,
                                        );
                                    }}
                                    onClearFilters={handleClearFilters}
                                />
                            )}
                        </div>

                        <div className="lg:col-span-4 flex flex-col gap-y-8">
                            <div className="flex flex-col sm:flex-row justify-end items-start sm:items-center mb-4 gap-4">
                                <div className="flex items-center space-x-2">
                                    <Label className="text-sm whitespace-nowrap">
                                        Show Debugger
                                    </Label>
                                    <Switch
                                        checked={showFacetDebugger}
                                        onCheckedChange={setShowFacetDebugger}
                                    />
                                </div>
                                <Select
                                    value={String(perPage)}
                                    onValueChange={(value) =>
                                        handlePerPageChange(parseInt(value))
                                    }
                                >
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue>
                                            Results per page
                                        </SelectValue>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {countDropdownOptions.map((option) => (
                                            <SelectItem
                                                key={option.value}
                                                value={String(option.value)}
                                            >
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Select
                                    value={sortBy}
                                    onValueChange={handleSortByChange}
                                >
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue>Sort by</SelectValue>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {sortDropdownOptions.map((option) => (
                                            <SelectItem
                                                key={option.value}
                                                value={option.value}
                                            >
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Search Results */}
                            <div className="space-y-4">
                                {/* Debugger - only show when toggle is enabled */}
                                {showFacetDebugger && (
                                    <FacetDebugger
                                        collectionSchema={collectionSchema}
                                        facetValues={facetValues}
                                        facetFields={facetFields}
                                    />
                                )}

                                {loadingDocuments ? (
                                    <SearchSkeleton />
                                ) : error ? (
                                    <Alert>
                                        <AlertDescription>
                                            {error}
                                        </AlertDescription>
                                    </Alert>
                                ) : searchResults.length === 0 ? (
                                    <Card>
                                        <CardContent className="p-8 text-center">
                                            <p className="text-muted-foreground">
                                                No documents found matching your
                                                search criteria.
                                            </p>
                                        </CardContent>
                                    </Card>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm text-muted-foreground">
                                                Found {totalResults} document
                                                {totalResults !== 1 ? 's' : ''}
                                            </p>
                                        </div>

                                        <div className="grid gap-4">
                                            {searchResults.map((result) => (
                                                <DocumentCard
                                                    key={result.id}
                                                    result={result}
                                                    collectionName={
                                                        collectionName
                                                    }
                                                    onDelete={
                                                        handleDeleteDocument
                                                    }
                                                />
                                            ))}
                                        </div>

                                        {totalPages > 1 && (
                                            <PaginationComponent
                                                currentPage={currentPage}
                                                totalPages={totalPages}
                                                onPageChange={handlePageChange}
                                            />
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
