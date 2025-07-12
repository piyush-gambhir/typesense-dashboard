'use client';

import { Clock, Code, Eye, Play, Search } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

import { getCollection, getCollections } from '@/lib/typesense/collections';
import { multiSearch } from '@/lib/typesense/documents';
import {
    type NLSearchModel,
    type NLSearchQuery,
    type NLSearchResponse,
    listNLSearchModels,
    naturalLanguageSearch,
} from '@/lib/typesense/nl-search-models';

import { useToast } from '@/hooks/useToast';

import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

import PaginationComponent from '@/components/common/Pagination';
import SearchFilters from '@/components/features/search/SearchFilters';

interface FacetValue {
    value: string | number | boolean;
    count: number;
}

function pluralize(word: string, count: number) {
    return count === 1 ? word : word + 's';
}

export default function NLSearchTest() {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [collections, setCollections] = useState<string[]>([]);
    const [models, setModels] = useState<NLSearchModel[]>([]);
    const [searchResults, setSearchResults] = useState<NLSearchResponse | null>(
        null,
    );
    const [collectionSchema, setCollectionSchema] = useState<{
        fields: Array<{
            name: string;
            type: string;
            facet: boolean;
        }>;
    } | null>(null);
    const [facetValues, setFacetValues] = useState<
        Record<string, FacetValue[]>
    >({});
    const [filterBy, setFilterBy] = useState<
        Record<string, (string | number | boolean)[]>
    >({});

    const [query, setQuery] = useState<NLSearchQuery>({
        collection: '',
        nl_query: '',
        query_by: '*',
        filter_by: '',
        per_page: 12,
        page: 1,
        debug: false,
    });

    const inputRef = useRef<HTMLTextAreaElement | null>(null);

    // Convert filterBy object to Typesense filter string
    const convertFilterByToString = (
        filterObj: Record<string, (string | number | boolean)[]>,
    ): string => {
        const filterParts: string[] = [];

        Object.entries(filterObj).forEach(([field, values]) => {
            if (values.length > 0) {
                const fieldFilters = values.map((value) => {
                    if (typeof value === 'boolean') {
                        return `${field}:=${value}`;
                    } else if (typeof value === 'number') {
                        return `${field}:=${value}`;
                    } else {
                        // For strings, we might want to handle special cases
                        return `${field}:="${value}"`;
                    }
                });
                filterParts.push(`(${fieldFilters.join(' || ')})`);
            }
        });

        return filterParts.join(' && ');
    };

    // Fetch collection schema and facet values when collection changes
    useEffect(() => {
        const fetchCollectionData = async () => {
            if (!query.collection) return;

            try {
                // Fetch collection schema
                const schemaResult = await getCollection(query.collection);
                if (schemaResult?.success && schemaResult.data) {
                    // Transform the schema to match the expected type
                    const transformedSchema = {
                        fields:
                            schemaResult.data.fields?.map(
                                (field: {
                                    name: string;
                                    type: string;
                                    facet?: boolean;
                                }) => ({
                                    name: field.name,
                                    type: field.type,
                                    facet: field.facet || false,
                                }),
                            ) || [],
                    };
                    setCollectionSchema(transformedSchema);
                }

                // Fetch facet values
                const facetFields =
                    schemaResult.data?.fields
                        ?.filter(
                            (field: { name: string; facet?: boolean }) =>
                                field.facet === true,
                        )
                        .map((field: { name: string }) => field.name) || [];

                if (facetFields.length > 0) {
                    const facetQuery = {
                        collection: query.collection,
                        q: '*',
                        queryBy: '*',
                        facetBy: facetFields.join(','),
                        maxFacetValues: 10,
                        perPage: 0,
                    };

                    const facetResponse = await multiSearch({
                        searchQueries: [facetQuery],
                    });

                    if (facetResponse?.results?.[0]?.facet_counts) {
                        const facetCounts =
                            facetResponse.results[0].facet_counts;
                        const facetData: Record<string, FacetValue[]> = {};

                        facetCounts.forEach(
                            (facet: {
                                field_name: string;
                                counts?: Array<{
                                    value: string;
                                    count: number;
                                }>;
                            }) => {
                                facetData[facet.field_name] =
                                    facet.counts?.map(
                                        (count: {
                                            value: string;
                                            count: number;
                                        }) => ({
                                            value: count.value,
                                            count: count.count,
                                        }),
                                    ) || [];
                            },
                        );

                        setFacetValues(facetData);
                    }
                } else {
                    setFacetValues({});
                }
            } catch (error) {
                console.error('Error fetching collection data:', error);
                toast({
                    title: 'Error',
                    description:
                        'Failed to fetch collection schema and facets.',
                    variant: 'destructive',
                });
            }
        };

        fetchCollectionData();
    }, [query.collection, toast]);

    // Update query.filter_by when filterBy object changes
    useEffect(() => {
        const filterString = convertFilterByToString(filterBy);
        setQuery((prev) => ({
            ...prev,
            filter_by: filterString,
        }));
    }, [filterBy]);

    const handleFilterChange = (
        field: string,
        value: string | number | boolean,
        checked: boolean,
    ) => {
        setFilterBy((prev) => {
            const currentValues = prev[field] || [];

            if (checked) {
                // Add value if not already present
                if (!currentValues.includes(value)) {
                    return {
                        ...prev,
                        [field]: [...currentValues, value],
                    };
                }
            } else {
                // Remove value
                return {
                    ...prev,
                    [field]: currentValues.filter((v) => v !== value),
                };
            }

            return prev;
        });
    };

    const handleClearFilters = () => {
        setFilterBy({});
    };

    // Fetch collections and models on component mount
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                // Fetch collections
                const collectionsResult = await getCollections();
                if (collectionsResult.success && collectionsResult.data) {
                    setCollections(
                        collectionsResult.data.map(
                            (col: { name: string }) => col.name,
                        ),
                    );
                    // Auto-select first collection if available
                    if (collectionsResult.data.length > 0) {
                        setQuery((prev) => ({
                            ...prev,
                            collection: collectionsResult.data[0].name,
                        }));
                    }
                } else {
                    toast({
                        title: 'Error',
                        description: 'Failed to fetch collections.',
                        variant: 'destructive',
                    });
                }

                // Fetch NL search models
                const modelsResult = await listNLSearchModels();
                if (modelsResult.success) {
                    setModels(modelsResult.data);
                    // Auto-select first model if available
                    if (modelsResult.data.length > 0) {
                        setQuery((prev) => ({
                            ...prev,
                            nl_model_id: modelsResult.data[0].id,
                        }));
                    }
                } else {
                    toast({
                        title: 'Error',
                        description: 'Failed to fetch NL search models.',
                        variant: 'destructive',
                    });
                }
            } catch (error) {
                console.error('Error fetching initial data:', error);
                toast({
                    title: 'Error',
                    description: 'Failed to fetch initial data.',
                    variant: 'destructive',
                });
            }
        };

        fetchInitialData();
    }, [toast]);

    const handleSearch = async () => {
        if (!query.collection || !query.nl_query.trim() || !query.nl_model_id) {
            toast({
                title: 'Invalid Input',
                description:
                    'Please select a collection, model, and enter a query.',
                variant: 'destructive',
            });
            if (inputRef.current) {
                inputRef.current.focus();
            }
            return;
        }

        setIsLoading(true);
        try {
            const result = await naturalLanguageSearch(query);
            if (result.success && result.data) {
                setSearchResults(result.data);
            } else {
                toast({
                    title: 'Search Failed',
                    description:
                        result.error ||
                        'Failed to perform natural language search.',
                    variant: 'destructive',
                });
            }
        } catch (error) {
            console.error('Search error:', error);
            toast({
                title: 'Search Error',
                description: 'An unexpected error occurred during search.',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handlePageChange = async (page: number) => {
        const updatedQuery = { ...query, page };
        setQuery(updatedQuery);

        // Trigger search with new page
        setIsLoading(true);
        try {
            const result = await naturalLanguageSearch(updatedQuery);
            if (result.success && result.data) {
                setSearchResults(result.data);
            } else {
                toast({
                    title: 'Search Failed',
                    description:
                        result.error ||
                        'Failed to perform natural language search.',
                    variant: 'destructive',
                });
            }
        } catch (error) {
            console.error('Search error:', error);
            toast({
                title: 'Search Error',
                description: 'An unexpected error occurred during search.',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Keyboard shortcut: Cmd/Ctrl+Enter to search
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (
                (e.ctrlKey || e.metaKey) &&
                e.key === 'Enter' &&
                document.activeElement === inputRef.current
            ) {
                handleSearch();
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
        // eslint-disable-next-line
    }, [query, isLoading]);

    return (
        <div className="p-4 md:p-8 flex flex-col gap-y-6 ">
            <Card className="border-none shadow-none bg-gradient-to-br from-muted/60 to-background/80">
                <CardHeader className="pb-2">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <CardTitle className="text-2xl font-bold flex items-center gap-2">
                                <Search className="h-6 w-6 text-primary" />
                                Natural Language Search
                            </CardTitle>
                            <CardDescription>
                                Search your collections using natural language
                                powered by AI.
                            </CardDescription>
                        </div>
                        <div className="flex gap-2">
                            <span className="inline-flex items-center px-2 py-1 rounded bg-muted text-xs font-medium">
                                {collections.length}{' '}
                                {pluralize('Collection', collections.length)}
                            </span>
                            <span className="inline-flex items-center px-2 py-1 rounded bg-muted text-xs font-medium">
                                {models.length}{' '}
                                {pluralize('Model', models.length)}
                            </span>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-8">
                        {/* Search Configuration */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="flex flex-col gap-y-2">
                                <Label htmlFor="collection">Collection</Label>
                                <Select
                                    value={query.collection}
                                    onValueChange={(value) =>
                                        setQuery((prev) => ({
                                            ...prev,
                                            collection: value,
                                        }))
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select collection" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {collections.map((collection) => (
                                            <SelectItem
                                                key={collection}
                                                value={collection}
                                            >
                                                {collection}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex flex-col gap-y-2">
                                <Label htmlFor="nl_model_id">
                                    Model{' '}
                                    <span className="text-destructive">*</span>
                                </Label>
                                <Select
                                    value={query.nl_model_id || ''}
                                    onValueChange={(value) =>
                                        setQuery((prev) => ({
                                            ...prev,
                                            nl_model_id: value,
                                        }))
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select model" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {models.map((model) => (
                                            <SelectItem
                                                key={model.id}
                                                value={model.id}
                                            >
                                                {model.model_name ||
                                                    model.name ||
                                                    model.id}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {models.length === 0 && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                        No NL search models found. Create models
                                        in the{' '}
                                        <Button
                                            variant="link"
                                            className="p-0 h-auto text-xs"
                                            onClick={() =>
                                                window.open(
                                                    '/nl-search-models',
                                                    '_blank',
                                                )
                                            }
                                        >
                                            Models page
                                        </Button>{' '}
                                        first.
                                    </p>
                                )}
                            </div>

                            <div className="flex flex-col gap-y-2">
                                <Label htmlFor="per_page">
                                    Results per page
                                </Label>
                                <Select
                                    value={query.per_page?.toString() || '12'}
                                    onValueChange={(value) =>
                                        setQuery((prev) => ({
                                            ...prev,
                                            per_page: parseInt(value),
                                        }))
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="12">12</SelectItem>
                                        <SelectItem value="24">24</SelectItem>
                                        <SelectItem value="48">48</SelectItem>
                                        <SelectItem value="96">96</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex flex-col gap-y-2">
                                <Label
                                    htmlFor="debug"
                                    className="flex items-center gap-2"
                                >
                                    <Switch
                                        id="debug"
                                        checked={query.debug}
                                        onCheckedChange={(checked) =>
                                            setQuery((prev) => ({
                                                ...prev,
                                                debug: checked,
                                            }))
                                        }
                                    />
                                    <span>Debug mode</span>
                                </Label>
                                <span className="text-xs text-muted-foreground">
                                    Show request/response details
                                </span>
                            </div>
                        </div>

                        <div className="flex flex-col gap-y-2">
                            <Label htmlFor="nl_query">
                                Natural Language Query{' '}
                                <span className="text-destructive">*</span>
                            </Label>
                            <Textarea
                                id="nl_query"
                                ref={inputRef}
                                value={query.nl_query}
                                onChange={(e) =>
                                    setQuery((prev) => ({
                                        ...prev,
                                        nl_query: e.target.value,
                                    }))
                                }
                                placeholder="e.g., Find red cars under $20,000"
                                rows={3}
                                className="resize-none"
                                onKeyDown={(e) => {
                                    if (
                                        (e.ctrlKey || e.metaKey) &&
                                        e.key === 'Enter'
                                    ) {
                                        handleSearch();
                                    }
                                }}
                            />
                            <span className="text-xs text-muted-foreground">
                                Press{' '}
                                <kbd className="px-1 py-0.5 bg-muted rounded border text-xs">
                                    Ctrl
                                </kbd>{' '}
                                +{' '}
                                <kbd className="px-1 py-0.5 bg-muted rounded border text-xs">
                                    Enter
                                </kbd>{' '}
                                to search
                            </span>
                        </div>

                        <div className="flex flex-col gap-y-2">
                            <Label htmlFor="filter_by">
                                Filter By{' '}
                                <span className="text-muted-foreground text-xs">
                                    (optional)
                                </span>
                            </Label>
                            <SearchFilters
                                collectionSchema={collectionSchema}
                                facetValues={facetValues}
                                filterBy={filterBy}
                                onFilterChange={handleFilterChange}
                                onClearFilters={handleClearFilters}
                            />
                        </div>

                        <div className="flex justify-end">
                            <Button
                                onClick={handleSearch}
                                disabled={
                                    isLoading ||
                                    !query.collection ||
                                    !query.nl_query.trim() ||
                                    !query.nl_model_id
                                }
                                className="w-full md:w-auto"
                                size="lg"
                            >
                                {isLoading ? (
                                    <>
                                        <Clock className="mr-2 h-4 w-4 animate-spin" />
                                        Searching...
                                    </>
                                ) : (
                                    <>
                                        <Search className="mr-2 h-4 w-4" />
                                        Search
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Results Section */}
            {searchResults && (
                <div className="space-y-8">
                    {/* Parsed Query Section */}
                    {searchResults.parsed_query && (
                        <Card className="border-none shadow-none bg-gradient-to-br from-muted/60 to-background/80">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Code className="h-5 w-5 text-primary" />
                                    Parsed Query
                                </CardTitle>
                                <CardDescription>
                                    How the AI model interpreted your query
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <Label className="text-sm font-medium">
                                            Search Terms
                                        </Label>
                                        <div className="mt-1 p-3 bg-muted rounded text-sm">
                                            <code>
                                                {searchResults.parsed_query
                                                    .query || 'N/A'}
                                            </code>
                                        </div>
                                    </div>
                                    {searchResults.parsed_query.filter_by && (
                                        <div>
                                            <Label className="text-sm font-medium">
                                                Filters
                                            </Label>
                                            <div className="mt-1 p-3 bg-muted rounded text-sm">
                                                <code>
                                                    {
                                                        searchResults
                                                            .parsed_query
                                                            .filter_by
                                                    }
                                                </code>
                                            </div>
                                        </div>
                                    )}
                                    {searchResults.parsed_query.sort_by && (
                                        <div>
                                            <Label className="text-sm font-medium">
                                                Sorting
                                            </Label>
                                            <div className="mt-1 p-3 bg-muted rounded text-sm">
                                                <code>
                                                    {
                                                        searchResults
                                                            .parsed_query
                                                            .sort_by
                                                    }
                                                </code>
                                            </div>
                                        </div>
                                    )}
                                    {searchResults.parsed_query.facet_by && (
                                        <div>
                                            <Label className="text-sm font-medium">
                                                Facets
                                            </Label>
                                            <div className="mt-1 p-3 bg-muted rounded text-sm">
                                                <code>
                                                    {
                                                        searchResults
                                                            .parsed_query
                                                            .facet_by
                                                    }
                                                </code>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Debug Info Section */}
                    {query.debug && (
                        <Card className="border-none shadow-none bg-gradient-to-br from-muted/60 to-background/80">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Eye className="h-5 w-5 text-primary" />
                                    Debug Information
                                </CardTitle>
                                <CardDescription>
                                    Detailed information about the search
                                    request and response
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <Label className="text-sm font-medium">
                                            Request Parameters
                                        </Label>
                                        <pre className="mt-1 text-xs bg-muted p-3 rounded overflow-x-auto">
                                            {JSON.stringify(
                                                searchResults.request_params,
                                                null,
                                                2,
                                            )}
                                        </pre>
                                    </div>
                                    {searchResults.parsed_nl_query && (
                                        <div>
                                            <Label className="text-sm font-medium">
                                                Parsed NL Query
                                            </Label>
                                            <pre className="mt-1 text-xs bg-muted p-3 rounded overflow-x-auto">
                                                {JSON.stringify(
                                                    searchResults.parsed_nl_query,
                                                    null,
                                                    2,
                                                )}
                                            </pre>
                                        </div>
                                    )}
                                    {searchResults.raw_llm_response && (
                                        <div>
                                            <Label className="text-sm font-medium">
                                                Raw LLM Response
                                            </Label>
                                            <pre className="mt-1 text-xs bg-muted p-3 rounded overflow-x-auto">
                                                {searchResults.raw_llm_response}
                                            </pre>
                                        </div>
                                    )}
                                    {searchResults.facet_counts &&
                                        searchResults.facet_counts.length >
                                            0 && (
                                            <div>
                                                <Label className="text-sm font-medium">
                                                    Facet Counts
                                                </Label>
                                                <pre className="mt-1 text-xs bg-muted p-3 rounded overflow-x-auto">
                                                    {JSON.stringify(
                                                        searchResults.facet_counts,
                                                        null,
                                                        2,
                                                    )}
                                                </pre>
                                            </div>
                                        )}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Search Results Section */}
                    <Card className="border-none shadow-none bg-gradient-to-br from-muted/60 to-background/80">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Play className="h-5 w-5 text-primary" />
                                Search Results
                            </CardTitle>
                            <CardDescription>
                                <span>
                                    <span className="font-semibold">
                                        {searchResults.found}
                                    </span>{' '}
                                    {pluralize('document', searchResults.found)}{' '}
                                    found
                                    {typeof searchResults.out_of === 'number' &&
                                    searchResults.out_of !== searchResults.found
                                        ? ` (out of ${searchResults.out_of})`
                                        : ''}
                                    {typeof searchResults.search_time_ms ===
                                    'number'
                                        ? ` in ${searchResults.search_time_ms}ms`
                                        : ''}
                                </span>
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {searchResults.hits &&
                            searchResults.hits.length > 0 ? (
                                <>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                        {searchResults.hits.map(
                                            (hit, index) => (
                                                <Card
                                                    key={index}
                                                    className="w-full flex flex-col justify-between shadow transition-shadow hover:shadow-lg border border-muted"
                                                >
                                                    <CardContent className="border-none shadow-none p-4">
                                                        <div className="space-y-3">
                                                            <div className="mb-2">
                                                                <span className="font-semibold text-xs md:text-sm block mb-1 text-muted-foreground uppercase tracking-wider">
                                                                    ID
                                                                </span>
                                                                <div className="text-sm md:text-base break-all font-mono">
                                                                    {
                                                                        hit
                                                                            .document
                                                                            .id
                                                                    }
                                                                </div>
                                                            </div>
                                                            {Object.entries(
                                                                hit.document,
                                                            )
                                                                .filter(
                                                                    ([key]) =>
                                                                        key !==
                                                                        'id',
                                                                )
                                                                .sort(
                                                                    (
                                                                        [keyA],
                                                                        [keyB],
                                                                    ) => {
                                                                        if (
                                                                            keyA ===
                                                                                'created_at' ||
                                                                            keyA ===
                                                                                'createdAt' ||
                                                                            keyA ===
                                                                                'updated_at' ||
                                                                            keyA ===
                                                                                'updatedAt'
                                                                        )
                                                                            return 1;
                                                                        if (
                                                                            keyB ===
                                                                                'created_at' ||
                                                                            keyB ===
                                                                                'createdAt' ||
                                                                            keyB ===
                                                                                'updated_at' ||
                                                                            keyB ===
                                                                                'updatedAt'
                                                                        )
                                                                            return -1;
                                                                        return 0;
                                                                    },
                                                                )
                                                                .map(
                                                                    ([
                                                                        key,
                                                                        value,
                                                                    ]) => (
                                                                        <div
                                                                            key={
                                                                                key
                                                                            }
                                                                            className="mb-2"
                                                                        >
                                                                            <span className="font-semibold text-xs md:text-sm block mb-1 text-muted-foreground">
                                                                                {
                                                                                    key
                                                                                }
                                                                            </span>
                                                                            <div className="text-xs md:text-sm">
                                                                                {Array.isArray(
                                                                                    value,
                                                                                ) ? (
                                                                                    <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                                                                                        {value.map(
                                                                                            (
                                                                                                item,
                                                                                                idx,
                                                                                            ) => (
                                                                                                <span
                                                                                                    key={
                                                                                                        idx
                                                                                                    }
                                                                                                    className="inline-block px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-md text-xs md:text-sm break-words"
                                                                                                >
                                                                                                    {String(
                                                                                                        item,
                                                                                                    )}
                                                                                                </span>
                                                                                            ),
                                                                                        )}
                                                                                    </div>
                                                                                ) : value ===
                                                                                      null ||
                                                                                  value ===
                                                                                      undefined ? (
                                                                                    <span className="text-gray-400 italic">
                                                                                        Not
                                                                                        available
                                                                                    </span>
                                                                                ) : (
                                                                                    <span>
                                                                                        {String(
                                                                                            value,
                                                                                        )}
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    ),
                                                                )}
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ),
                                        )}
                                    </div>

                                    {/* Pagination */}
                                    {searchResults.found >
                                        (query.per_page || 12) && (
                                        <div className="mt-8 flex justify-center">
                                            <PaginationComponent
                                                currentPage={query.page || 1}
                                                totalPages={Math.ceil(
                                                    searchResults.found /
                                                        (query.per_page || 12),
                                                )}
                                                onPageChange={handlePageChange}
                                            />
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="text-center text-muted-foreground py-12 text-lg">
                                    <span className="block mb-2">
                                        <Search className="inline h-8 w-8 mb-1" />
                                    </span>
                                    No documents found.
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Empty State */}
            {!searchResults && (
                <Card className="bg-gradient-to-br from-muted/60 to-background/80 border-none shadow-none">
                    <CardContent>
                        <div className="flex flex-col items-center justify-center py-16">
                            <Search className="h-14 w-14 text-muted-foreground mb-4" />
                            <h3 className="text-xl font-semibold mb-2">
                                Ready to Search
                            </h3>
                            <p className="text-muted-foreground text-center max-w-md">
                                Configure your search parameters and run a
                                natural language query to see results here.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
