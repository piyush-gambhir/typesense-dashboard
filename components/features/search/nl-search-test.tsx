'use client';

import { AlertCircle, Clock, Code, Eye, Play, Search, Sparkles, Zap } from 'lucide-react';
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

import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

import PaginationComponent from '@/components/common/pagination';
import SearchFilters from '@/components/features/search/search-filters';

type FacetValue = {
    value: string | number | boolean;
    count: number;
};

type FilterBy = Record<string, (string | number | boolean)[]>;

type CollectionSchema = {
    fields: Array<{
        name: string;
        type: string;
        facet: boolean;
    }>;
} | null;

function pluralize(word: string, count: number) {
    return count === 1 ? word : word + 's';
}

function SearchConfigurationSkeleton() {
    return (
        <Card className="border border-border/50">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="space-y-2">
                        <Skeleton className="h-7 w-64" />
                        <Skeleton className="h-4 w-96" />
                    </div>
                    <div className="flex gap-2">
                        <Skeleton className="h-6 w-20 rounded-full" />
                        <Skeleton className="h-6 w-16 rounded-full" />
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="space-y-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                    ))}
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-20 w-full" />
                </div>
                <div className="flex justify-end">
                    <Skeleton className="h-10 w-24" />
                </div>
            </CardContent>
        </Card>
    );
}

function LoadingState() {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="space-y-8">
                {/* Header Skeleton */}
                <div className="space-y-2">
                    <Skeleton className="h-8 w-80" />
                    <Skeleton className="h-4 w-96" />
                </div>

                {/* Configuration Skeleton */}
                <SearchConfigurationSkeleton />

                {/* Empty State Skeleton */}
                <Card className="border border-border/50">
                    <CardContent>
                        <div className="flex flex-col items-center justify-center py-16 space-y-4">
                            <Skeleton className="h-14 w-14 rounded-full" />
                            <Skeleton className="h-6 w-32" />
                            <Skeleton className="h-4 w-64" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function ErrorState({ error }: { error: string }) {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-2xl mx-auto">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            </div>
        </div>
    );
}

function EmptySearchState() {
    return (
        <Card className="border border-border/50">
            <CardContent>
                <div className="flex flex-col items-center justify-center py-16 space-y-6">
                    <div className="relative">
                        <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center ring-1 ring-primary/20 shadow-lg">
                            <Search className="h-10 w-10 text-primary" />
                        </div>
                        <div className="absolute -top-1 -right-1">
                            <div className="w-6 h-6 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center ring-2 ring-background shadow-lg">
                                <Sparkles className="h-3 w-3 text-white" />
                            </div>
                        </div>
                    </div>
                    <div className="text-center space-y-3">
                        <h3 className="text-2xl font-semibold tracking-tight">
                            Ready to Search
                        </h3>
                        <p className="text-muted-foreground leading-relaxed max-w-md">
                            Configure your search parameters and run a natural language query to see results here.
                            Use AI-powered search to find exactly what you're looking for.
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function ResultCard({ hit, index }: { hit: { document: Record<string, unknown> }; index: number }) {
    return (
        <Card className="relative overflow-hidden border border-border/50 bg-gradient-to-br from-card via-card to-card/95 shadow-sm backdrop-blur-sm transition-all hover:shadow-md">
            <CardContent className="p-6">
                <div className="space-y-3">
                    <div className="mb-2">
                        <span className="font-semibold text-xs md:text-sm block mb-1 text-muted-foreground uppercase tracking-wider">
                            ID
                        </span>
                        <div className="text-sm md:text-base break-all font-mono bg-muted/30 p-2 rounded border">
                            {String(hit.document.id)}
                        </div>
                    </div>
                    {Object.entries(hit.document)
                        .filter(([key]) => key !== 'id')
                        .sort(([keyA], [keyB]) => {
                            if (
                                keyA === 'created_at' ||
                                keyA === 'createdAt' ||
                                keyA === 'updated_at' ||
                                keyA === 'updatedAt'
                            )
                                return 1;
                            if (
                                keyB === 'created_at' ||
                                keyB === 'createdAt' ||
                                keyB === 'updated_at' ||
                                keyB === 'updatedAt'
                            )
                                return -1;
                            return 0;
                        })
                        .map(([key, value]) => (
                            <div key={`${index}-${key}`} className="mb-2">
                                <span className="font-semibold text-xs md:text-sm block mb-1 text-muted-foreground">
                                    {key}
                                </span>
                                <div className="text-xs md:text-sm">
                                    {Array.isArray(value) ? (
                                        <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                                            {value.map((item, idx) => (
                                                <span
                                                    key={`${index}-${key}-${idx}`}
                                                    className="inline-block px-2 py-1 bg-muted/50 rounded-md text-xs md:text-sm break-words border"
                                                >
                                                    {String(item)}
                                                </span>
                                            ))}
                                        </div>
                                    ) : value === null || value === undefined ? (
                                        <span className="text-muted-foreground italic">
                                            Not available
                                        </span>
                                    ) : (
                                        <span className="break-words">
                                            {String(value)}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                </div>
            </CardContent>
        </Card>
    );
}

export default function NLSearchTest() {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [collections, setCollections] = useState<string[]>([]);
    const [models, setModels] = useState<NLSearchModel[]>([]);
    const [searchResults, setSearchResults] = useState<NLSearchResponse | null>(null);
    const [collectionSchema, setCollectionSchema] = useState<CollectionSchema>(null);
    const [facetValues, setFacetValues] = useState<Record<string, FacetValue[]>>({});
    const [filterBy, setFilterBy] = useState<FilterBy>({});
    const [error, setError] = useState<string | null>(null);

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
    const convertFilterByToString = (filterObj: FilterBy): string => {
        const filterParts: string[] = [];

        Object.entries(filterObj).forEach(([field, values]) => {
            if (values.length > 0) {
                const fieldFilters = values.map((value) => {
                    if (typeof value === 'boolean') {
                        return `${field}:=${value}`;
                    } else if (typeof value === 'number') {
                        return `${field}:=${value}`;
                    } else {
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
                const schemaResult = await getCollection(query.collection);
                if (schemaResult?.success && schemaResult.data) {
                    const transformedSchema = {
                        fields:
                            schemaResult.data.fields?.map((field: {
                                name: string;
                                type: string;
                                facet?: boolean;
                            }) => ({
                                name: field.name,
                                type: field.type,
                                facet: field.facet || false,
                            })) || [],
                    };
                    setCollectionSchema(transformedSchema);
                }

                const facetFields =
                    schemaResult.data?.fields
                        ?.filter((field: { name: string; facet?: boolean }) => field.facet === true)
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
                        const facetCounts = facetResponse.results[0].facet_counts;
                        const facetData: Record<string, FacetValue[]> = {};

                        facetCounts.forEach((facet: {
                            field_name: string;
                            counts?: Array<{
                                value: string;
                                count: number;
                            }>;
                        }) => {
                            facetData[facet.field_name] =
                                facet.counts?.map((count: { value: string; count: number }) => ({
                                    value: count.value,
                                    count: count.count,
                                })) || [];
                        });

                        setFacetValues(facetData);
                    }
                } else {
                    setFacetValues({});
                }
            } catch (error) {
                console.error('Error fetching collection data:', error);
                toast({
                    title: 'Error',
                    description: 'Failed to fetch collection schema and facets.',
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
                if (!currentValues.includes(value)) {
                    return {
                        ...prev,
                        [field]: [...currentValues, value],
                    };
                }
            } else {
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
                setError(null);

                const collectionsResult = await getCollections();
                if (collectionsResult.success && collectionsResult.data) {
                    setCollections(collectionsResult.data.map((col: { name: string }) => col.name));
                    if (collectionsResult.data.length > 0) {
                        setQuery((prev) => ({
                            ...prev,
                            collection: collectionsResult.data[0].name,
                        }));
                    }
                } else {
                    const errorMsg = collectionsResult.error || 'Failed to fetch collections.';
                    setError(errorMsg);
                    toast({
                        title: 'Error',
                        description: errorMsg,
                        variant: 'destructive',
                    });
                }

                const modelsResult = await listNLSearchModels();
                if (modelsResult.success && modelsResult.data) {
                    setModels(modelsResult.data);
                    if (modelsResult.data.length > 0) {
                        setQuery((prev) => ({
                            ...prev,
                            nl_model_id: modelsResult.data[0].id,
                        }));
                    }
                } else {
                    const errorMsg = modelsResult.error || 'Failed to fetch NL search models.';
                    toast({
                        title: 'Error',
                        description: errorMsg,
                        variant: 'destructive',
                    });
                }
            } catch (error) {
                console.error('Error fetching initial data:', error);
                const errorMsg = 'Failed to fetch initial data.';
                setError(errorMsg);
                toast({
                    title: 'Error',
                    description: errorMsg,
                    variant: 'destructive',
                });
            } finally {
                setIsInitialLoading(false);
            }
        };

        fetchInitialData();
    }, [toast]);

    const handleSearch = async () => {
        if (!query.collection || !query.nl_query.trim() || !query.nl_model_id) {
            toast({
                title: 'Invalid Input',
                description: 'Please select a collection, model, and enter a query.',
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
                    description: result.error || 'Failed to perform natural language search.',
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

        setIsLoading(true);
        try {
            const result = await naturalLanguageSearch(updatedQuery);
            if (result.success && result.data) {
                setSearchResults(result.data);
            } else {
                toast({
                    title: 'Search Failed',
                    description: result.error || 'Failed to perform natural language search.',
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
    }, [query, isLoading]);

    if (isInitialLoading) {
        return <LoadingState />;
    }

    if (error) {
        return <ErrorState error={error} />;
    }

    const searchTime = searchResults?.search_time_ms 
        ? `in ${searchResults.search_time_ms}ms` 
        : '';

    return (
        <div className="container mx-auto px-4 py-8 space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                        <div className="relative">
                            <Search className="h-8 w-8 text-primary" />
                            <div className="absolute -top-1 -right-1">
                                <div className="w-4 h-4 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center">
                                    <Sparkles className="h-2 w-2 text-white" />
                                </div>
                            </div>
                        </div>
                        Natural Language Search
                    </h1>
                    <p className="text-muted-foreground">
                        Search your collections using natural language powered by AI models
                    </p>
                </div>
                <div className="flex gap-2">
                    <Badge variant="secondary" className="gap-1">
                        <span>{collections.length}</span>
                        <span>{pluralize('Collection', collections.length)}</span>
                    </Badge>
                    <Badge variant="secondary" className="gap-1">
                        <span>{models.length}</span>
                        <span>{pluralize('Model', models.length)}</span>
                    </Badge>
                </div>
            </div>

            {/* Search Configuration */}
            <Card className="border border-border/50">
                <CardHeader>
                    <CardTitle className="text-xl font-semibold flex items-center gap-2">
                        <div className="p-2 bg-primary/10 rounded-lg ring-1 ring-primary/20">
                            <Zap className="h-5 w-5 text-primary" />
                        </div>
                        Search Configuration
                    </CardTitle>
                    <CardDescription>
                        Configure your search parameters and AI model settings
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="space-y-2">
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
                                        <SelectItem key={collection} value={collection}>
                                            {collection}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="nl_model_id">
                                AI Model <span className="text-destructive">*</span>
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
                                    <SelectValue placeholder="Select AI model" />
                                </SelectTrigger>
                                <SelectContent>
                                    {models.map((model) => (
                                        <SelectItem key={model.id} value={model.id}>
                                            {model.model_name || model.name || model.id}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {models.length === 0 && (
                                <p className="text-xs text-muted-foreground mt-1">
                                    No AI models found. Create models in the{' '}
                                    <Button
                                        variant="link"
                                        className="p-0 h-auto text-xs underline"
                                        onClick={() => {
                                            if (typeof window !== 'undefined') {
                                                window.open('/nl-search-models', '_blank');
                                            }
                                        }}
                                    >
                                        Models page
                                    </Button>{' '}
                                    first.
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="per_page">Results per page</Label>
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

                        <div className="space-y-2">
                            <Label htmlFor="debug" className="flex items-center gap-2">
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
                                Show detailed request/response information
                            </span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="nl_query">
                            Natural Language Query <span className="text-destructive">*</span>
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
                            placeholder="e.g., Find red cars under $20,000 with good fuel efficiency"
                            rows={3}
                            className="resize-none"
                            onKeyDown={(e) => {
                                if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                                    handleSearch();
                                }
                            }}
                        />
                        <div className="flex items-center justify-between">
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
                            <span className="text-xs text-muted-foreground">
                                {query.nl_query.length} characters
                            </span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="filter_by">
                            Advanced Filters{' '}
                            <span className="text-muted-foreground text-xs">(optional)</span>
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
                            className="gap-2 bg-gradient-to-r from-primary to-primary/90 shadow-lg font-medium px-8"
                            size="lg"
                        >
                            {isLoading ? (
                                <>
                                    <Clock className="h-4 w-4 animate-spin" />
                                    Searching...
                                </>
                            ) : (
                                <>
                                    <Search className="h-4 w-4" />
                                    Search with AI
                                </>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Results Section */}
            {searchResults && (
                <div className="space-y-8">
                    {/* Parsed Query Section */}
                    {searchResults.parsed_query && (
                        <Card className="border border-border/50">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <div className="p-2 bg-blue-500/10 rounded-lg ring-1 ring-blue-500/20">
                                        <Code className="h-5 w-5 text-blue-600" />
                                    </div>
                                    AI Query Interpretation
                                </CardTitle>
                                <CardDescription>
                                    How the AI model interpreted and processed your natural language query
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <Label className="text-sm font-medium">Search Terms</Label>
                                        <div className="mt-1 p-3 bg-muted/30 rounded border text-sm">
                                            <code>{searchResults.parsed_query.query || 'N/A'}</code>
                                        </div>
                                    </div>
                                    {searchResults.parsed_query.filter_by && (
                                        <div>
                                            <Label className="text-sm font-medium">Applied Filters</Label>
                                            <div className="mt-1 p-3 bg-muted/30 rounded border text-sm">
                                                <code>{searchResults.parsed_query.filter_by}</code>
                                            </div>
                                        </div>
                                    )}
                                    {searchResults.parsed_query.sort_by && (
                                        <div>
                                            <Label className="text-sm font-medium">Sort Order</Label>
                                            <div className="mt-1 p-3 bg-muted/30 rounded border text-sm">
                                                <code>{searchResults.parsed_query.sort_by}</code>
                                            </div>
                                        </div>
                                    )}
                                    {searchResults.parsed_query.facet_by && (
                                        <div>
                                            <Label className="text-sm font-medium">Facets</Label>
                                            <div className="mt-1 p-3 bg-muted/30 rounded border text-sm">
                                                <code>{searchResults.parsed_query.facet_by}</code>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Debug Info Section */}
                    {query.debug && (
                        <Card className="border border-border/50">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <div className="p-2 bg-purple-500/10 rounded-lg ring-1 ring-purple-500/20">
                                        <Eye className="h-5 w-5 text-purple-600" />
                                    </div>
                                    Debug Information
                                </CardTitle>
                                <CardDescription>
                                    Detailed technical information about the search request and AI response
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <Label className="text-sm font-medium">Request Parameters</Label>
                                        <pre className="mt-1 text-xs bg-muted/30 p-3 rounded border overflow-x-auto">
                                            {JSON.stringify(searchResults.request_params, null, 2)}
                                        </pre>
                                    </div>
                                    {searchResults.parsed_nl_query && (
                                        <div>
                                            <Label className="text-sm font-medium">Parsed NL Query</Label>
                                            <pre className="mt-1 text-xs bg-muted/30 p-3 rounded border overflow-x-auto">
                                                {JSON.stringify(searchResults.parsed_nl_query, null, 2)}
                                            </pre>
                                        </div>
                                    )}
                                    {searchResults.raw_llm_response && (
                                        <div>
                                            <Label className="text-sm font-medium">Raw AI Response</Label>
                                            <pre className="mt-1 text-xs bg-muted/30 p-3 rounded border overflow-x-auto">
                                                {searchResults.raw_llm_response}
                                            </pre>
                                        </div>
                                    )}
                                    {searchResults.facet_counts && searchResults.facet_counts.length > 0 && (
                                        <div>
                                            <Label className="text-sm font-medium">Facet Counts</Label>
                                            <pre className="mt-1 text-xs bg-muted/30 p-3 rounded border overflow-x-auto">
                                                {JSON.stringify(searchResults.facet_counts, null, 2)}
                                            </pre>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Search Results Section */}
                    <Card className="border border-border/50">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <div className="p-2 bg-emerald-500/10 rounded-lg ring-1 ring-emerald-500/20">
                                    <Play className="h-5 w-5 text-emerald-600" />
                                </div>
                                Search Results
                            </CardTitle>
                            <CardDescription className="flex items-center justify-between">
                                <span>
                                    <span className="font-semibold">{searchResults.found}</span>{' '}
                                    {pluralize('document', searchResults.found)} found
                                    {typeof searchResults.out_of === 'number' &&
                                    searchResults.out_of !== searchResults.found
                                        ? ` (out of ${searchResults.out_of})`
                                        : ''}
                                    {searchTime && ` ${searchTime}`}
                                </span>
                                {searchResults.found > 0 && typeof searchResults.search_time_ms === 'number' && (
                                    <Badge variant="secondary" className="gap-1">
                                        <Clock className="h-3 w-3" />
                                        {searchResults.search_time_ms}ms
                                    </Badge>
                                )}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {searchResults.hits && searchResults.hits.length > 0 ? (
                                <>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                        {searchResults.hits.map((hit, index) => (
                                            <ResultCard key={`result-${index}`} hit={hit} index={index} />
                                        ))}
                                    </div>

                                    {/* Pagination */}
                                    {searchResults.found > (query.per_page || 12) && (
                                        <div className="mt-8 flex justify-center">
                                            <PaginationComponent
                                                currentPage={query.page || 1}
                                                totalPages={Math.ceil(
                                                    searchResults.found / (query.per_page || 12),
                                                )}
                                                onPageChange={handlePageChange}
                                            />
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="text-center text-muted-foreground py-12">
                                    <div className="space-y-4">
                                        <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto">
                                            <Search className="h-8 w-8" />
                                        </div>
                                        <div className="space-y-2">
                                            <h3 className="text-lg font-medium">No documents found</h3>
                                            <p className="text-sm">
                                                Try adjusting your search query or removing some filters
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Empty State */}
            {!searchResults && <EmptySearchState />}
        </div>
    );
}