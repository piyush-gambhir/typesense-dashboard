'use client';

import { Clock, Code, Eye, Play, Search } from 'lucide-react';
import React, { useEffect, useState } from 'react';

import { getCollections } from '@/lib/typesense/collections';
import {
  type NLSearchModel,
  type NLSearchQuery,
  type NLSearchResponse,
  listNLSearchModels,
  naturalLanguageSearch,
} from '@/lib/typesense/nl-search-models';

import { useToast } from '@/hooks/useToast';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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

export default function NLSearchTest() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [collections, setCollections] = useState<string[]>([]);
  const [models, setModels] = useState<NLSearchModel[]>([]);
  const [searchResults, setSearchResults] = useState<NLSearchResponse | null>(
    null,
  );

  const [query, setQuery] = useState<NLSearchQuery>({
    collection: '',
    nl_query: '',
    query_by: '*',
    per_page: 10,
    page: 1,
    debug: true,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch collections
        const collectionsResult = await getCollections();
        if (collectionsResult.success) {
          setCollections(collectionsResult.data.map((col: any) => col.name));
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
        } else {
          toast({
            title: 'Error',
            description: 'Failed to fetch NL search models.',
            variant: 'destructive',
          });
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch initial data.',
          variant: 'destructive',
        });
      }
    };

    fetchData();
  }, [toast]);

  const handleSearch = async () => {
    if (!query.collection || !query.nl_query.trim()) {
      toast({
        title: 'Invalid Input',
        description: 'Please select a collection and enter a query.',
        variant: 'destructive',
      });
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
            result.error || 'Failed to perform natural language search.',
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
            result.error || 'Failed to perform natural language search.',
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

  return (
    <div className="p-4 md:p-8 flex flex-col gap-y-4">
      <Card className="border-none shadow-none">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-2xl font-bold">
                Natural Language Search Test
              </CardTitle>
              <CardDescription>
                Test natural language search functionality with your collections
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline">Collections: {collections.length}</Badge>
              <Badge variant="secondary">Models: {models.length}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Search Configuration */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                      <SelectItem key={collection} value={collection}>
                        {collection}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-y-2">
                <Label htmlFor="nl_model_id">Model (Optional)</Label>
                <Select
                  value={query.nl_model_id || 'default'}
                  onValueChange={(value) =>
                    setQuery((prev) => ({
                      ...prev,
                      nl_model_id: value === 'default' ? undefined : value,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default Model</SelectItem>
                    {models.map((model) => (
                      <SelectItem key={model.id} value={model.id}>
                        {model.model_name || model.name || model.id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {models.length === 0 && (
                  <p className="text-sm text-muted-foreground mt-1">
                    No NL search models found. Create models in the{' '}
                    <Button
                      variant="link"
                      className="p-0 h-auto"
                      onClick={() => window.open('/nl-search-models', '_blank')}
                    >
                      Models page
                    </Button>{' '}
                    first.
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-y-2">
                <Label htmlFor="per_page">Results per page</Label>
                <Select
                  value={query.per_page?.toString() || '10'}
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
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-col gap-y-2">
              <Label htmlFor="nl_query">Natural Language Query</Label>
              <Textarea
                id="nl_query"
                value={query.nl_query}
                onChange={(e) =>
                  setQuery((prev) => ({
                    ...prev,
                    nl_query: e.target.value,
                  }))
                }
                placeholder="e.g., Find red cars under $20,000"
                rows={3}
              />
            </div>

            <Separator />

            <div className="flex space-x-2">
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
              <Label htmlFor="debug">Enable debug mode</Label>
            </div>

            <Button
              onClick={handleSearch}
              disabled={
                isLoading || !query.collection || !query.nl_query.trim()
              }
              className="w-full"
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
        </CardContent>
      </Card>

      {/* Results Section */}
      {searchResults && (
        <div className="space-y-6">
          {/* Parsed Query Section */}
          {searchResults.parsed_query && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  Parsed Query
                </CardTitle>
                <CardDescription>
                  How the AI model interpreted your natural language query
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 flex flex-col gap-y-2">
                  <div>
                    <Label className="text-sm font-medium">Search Terms</Label>
                    <div className="mt-1 p-3 bg-muted rounded">
                      <code>{searchResults.parsed_query.query || 'N/A'}</code>
                    </div>
                  </div>
                  {searchResults.parsed_query.filter_by && (
                    <div className="flex flex-col gap-y-2">
                      <Label className="text-sm font-medium">Filters</Label>
                      <div className="mt-1 p-3 bg-muted rounded">
                        <code>{searchResults.parsed_query.filter_by}</code>
                      </div>
                    </div>
                  )}
                  {searchResults.parsed_query.sort_by && (
                    <div className="flex flex-col gap-y-2">
                      <Label className="text-sm font-medium">Sorting</Label>
                      <div className="mt-1 p-3 bg-muted rounded">
                        <code>{searchResults.parsed_query.sort_by}</code>
                      </div>
                    </div>
                  )}
                  {searchResults.parsed_query.facet_by && (
                    <div className="flex flex-col gap-y-2">
                      <Label className="text-sm font-medium">Facets</Label>
                      <div className="mt-1 p-3 bg-muted rounded">
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
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Debug Information
                </CardTitle>
                <CardDescription>
                  Detailed information about the search request and response
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 flex flex-col gap-y-2">
                  <div className="flex flex-col gap-y-2">
                    <Label className="text-sm font-medium">
                      Request Parameters
                    </Label>
                    <pre className="mt-1 text-xs bg-muted p-3 rounded overflow-auto max-h-40">
                      {JSON.stringify(searchResults.request_params, null, 2)}
                    </pre>
                  </div>
                  {searchResults.parsed_nl_query && (
                    <div className="flex flex-col gap-y-2">
                      <Label className="text-sm font-medium">
                        Parsed NL Query
                      </Label>
                      <pre className="mt-1 text-xs bg-muted p-3 rounded overflow-auto max-h-40">
                        {JSON.stringify(searchResults.parsed_nl_query, null, 2)}
                      </pre>
                    </div>
                  )}
                  {searchResults.raw_llm_response && (
                    <div className="flex flex-col gap-y-2">
                      <Label className="text-sm font-medium">
                        Raw LLM Response
                      </Label>
                      <pre className="mt-1 text-xs bg-muted p-3 rounded overflow-auto max-h-40">
                        {searchResults.raw_llm_response}
                      </pre>
                    </div>
                  )}
                  {searchResults.facet_counts &&
                    searchResults.facet_counts.length > 0 && (
                      <div className="flex flex-col gap-y-2">
                        <Label className="text-sm font-medium">
                          Facet Counts
                        </Label>
                        <pre className="mt-1 text-xs bg-muted p-3 rounded overflow-auto max-h-40">
                          {JSON.stringify(searchResults.facet_counts, null, 2)}
                        </pre>
                      </div>
                    )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Search Results Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="h-5 w-5" />
                Search Results
              </CardTitle>
              <CardDescription>
                Found {searchResults.found} documents out of{' '}
                {searchResults.out_of || searchResults.found} total documents in{' '}
                {searchResults.search_time_ms}ms
              </CardDescription>
            </CardHeader>
            <CardContent>
              {searchResults.hits && searchResults.hits.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {searchResults.hits.map((hit, index) => (
                      <Card
                        key={index}
                        className="w-full flex flex-col justify-between"
                      >
                        <CardContent className="p-4 md:p-6">
                          <div className="space-y-4">
                            <div className="mb-4">
                              <span className="font-semibold text-sm md:text-base block mb-2">
                                ID
                              </span>
                              <div className="text-sm md:text-base break-all">
                                {hit.document.id}
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
                                <div key={key} className="mb-4">
                                  <span className="font-semibold text-sm md:text-base block mb-2">
                                    {key}
                                  </span>
                                  <div className="text-sm md:text-base">
                                    {Array.isArray(value) ? (
                                      <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto">
                                        {value.map((item, idx) => (
                                          <span
                                            key={idx}
                                            className="inline-block px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-md text-xs md:text-sm break-words"
                                          >
                                            {String(item)}
                                          </span>
                                        ))}
                                      </div>
                                    ) : value === null ||
                                      value === undefined ? (
                                      <span className="text-gray-400 italic">
                                        Not available
                                      </span>
                                    ) : (
                                      <span>{String(value)}</span>
                                    )}
                                  </div>
                                </div>
                              ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Pagination */}
                  {searchResults.found > query.per_page && (
                    <div className="mt-6 flex justify-center">
                      <PaginationComponent
                        currentPage={query.page}
                        totalPages={Math.ceil(
                          searchResults.found / query.per_page,
                        )}
                        onPageChange={handlePageChange}
                      />
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  No documents found.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Empty State */}
      {!searchResults && (
        <Card>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12">
              <Search className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Ready to Search</h3>
              <p className="text-muted-foreground text-center">
                Configure your search parameters and run a natural language
                query to see results here.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
