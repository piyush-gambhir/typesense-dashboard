'use client';

import React, { useState, useEffect } from 'react';
import { Search, Bot, Settings, Eye, Code, Play, Clock } from 'lucide-react';

import {
  naturalLanguageSearch,
  listNLSearchModels,
  type NLSearchQuery,
  type NLSearchResponse,
  type NLSearchModel,
} from '@/lib/typesense/nl-search-models';
import { getCollections } from '@/lib/typesense/collections';

import { useToast } from '@/hooks/useToast';

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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface SearchResult {
  document: any;
  text_match?: number;
}

export default function NLSearchTest() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [collections, setCollections] = useState<string[]>([]);
  const [models, setModels] = useState<NLSearchModel[]>([]);
  const [searchResults, setSearchResults] = useState<NLSearchResponse | null>(null);

  const [query, setQuery] = useState<NLSearchQuery>({
    collection: '',
    nl_query: '',
    query_by: '*',
    per_page: 10,
    page: 1,
    debug: false,
  });

  useEffect(() => {
    fetchCollections();
    fetchModels();
  }, []);

  // Test Typesense connection
  const testConnection = async () => {
    try {
      const result = await getCollections();
      if (result.success) {
        toast({
          title: 'Connection Test Passed',
          description: `Successfully connected to Typesense. Found ${result.data?.length || 0} collections.`,
        });
      } else {
        toast({
          title: 'Connection Test Failed',
          description: result.error || 'Failed to connect to Typesense.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Connection Test Error',
        description: 'Failed to test connection to Typesense.',
        variant: 'destructive',
      });
    }
  };

  const fetchCollections = async () => {
    try {
      const result = await getCollections();
      if (result.success && result.data) {
        setCollections(result.data.map((col: any) => col.name));
        console.log('Collections loaded:', result.data.length);
        // Auto-select first collection if available
        if (result.data.length > 0) {
          setQuery((prev) => ({ ...prev, collection: result.data[0].name }));
        }
      } else {
        console.error('Failed to fetch collections:', result.error);
        toast({
          title: 'Collections Loading Error',
          description: result.error || 'Failed to load collections.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error fetching collections:', error);
      toast({
        title: 'Collections Loading Error',
        description: 'Failed to load collections.',
        variant: 'destructive',
      });
    }
  };

  const fetchModels = async () => {
    try {
      const result = await listNLSearchModels();
      if (result.success && result.data) {
        setModels(result.data);
        console.log('Models loaded:', result.data);
      } else {
        console.error('Failed to fetch models:', result.error);
        toast({
          title: 'Models Loading Error',
          description: result.error || 'Failed to load NL search models.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error fetching models:', error);
      toast({
        title: 'Models Loading Error',
        description: 'Failed to load NL search models.',
        variant: 'destructive',
      });
    }
  };

  const handleSearch = async () => {
    if (!query.collection || !query.nl_query.trim()) {
      toast({
        title: 'Missing Information',
        description: 'Please select a collection and enter a search query.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await naturalLanguageSearch(query);
      if (result.success && result.data) {
        setSearchResults(result.data);
        toast({
          title: 'Search Completed',
          description: `Found ${result.data.found} results in ${result.data.search_time_ms}ms`,
        });
      } else {
        toast({
          title: 'Search Failed',
          description: result.error || 'Failed to perform natural language search.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to perform natural language search.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const exampleQueries = [
    "Find red cars under $20,000",
    "Show me the most popular products",
    "Search for documents about API integration",
    "Find articles published last month about React",
    "Show me high-rated products in electronics category",
  ];

  return (
    <div className="container mx-auto p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Bot className="h-8 w-8" />
            Natural Language Search Test
          </h1>
          <p className="text-muted-foreground mt-2">
            Test and debug your natural language search queries
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={testConnection} variant="outline" size="sm">
            Test Connection
          </Button>
          <Badge variant="secondary">
            Collections: {collections.length}
          </Badge>
          <Badge variant="secondary">
            Models: {models.length}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Search Configuration */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Search Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="collection">Collection</Label>
                <Select
                  value={query.collection}
                  onValueChange={(value) =>
                    setQuery((prev) => ({ ...prev, collection: value }))
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

              <div>
                <Label htmlFor="model_id">Model (Optional)</Label>
                <Select
                  value={query.model_id || 'default'}
                  onValueChange={(value) =>
                    setQuery((prev) => ({ ...prev, model_id: value === 'default' ? undefined : value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Use default model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default Model</SelectItem>
                    {models.map((model) => (
                      <SelectItem key={model.id} value={model.id}>
                        {model.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {models.length === 0 && (
                  <p className="text-sm text-muted-foreground mt-1">
                    No NL search models found. Create models in the{' '}
                    <Button variant="link" className="p-0 h-auto" onClick={() => window.open('/nl-search-models', '_blank')}>
                      Models page
                    </Button>
                    {' '}first.
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="nl_query">Natural Language Query</Label>
                <Textarea
                  id="nl_query"
                  value={query.nl_query}
                  onChange={(e) =>
                    setQuery((prev) => ({ ...prev, nl_query: e.target.value }))
                  }
                  placeholder="e.g., Find red cars under $20,000"
                  rows={3}
                />
              </div>

              <div>
                <Label>Example Queries</Label>
                <div className="mt-2 space-y-1">
                  {exampleQueries.map((example, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-left text-xs h-auto py-1 px-2"
                      onClick={() =>
                        setQuery((prev) => ({ ...prev, nl_query: example }))
                      }
                    >
                      {example}
                    </Button>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="per_page">Results per page</Label>
                  <Input
                    id="per_page"
                    type="number"
                    value={query.per_page}
                    onChange={(e) =>
                      setQuery((prev) => ({
                        ...prev,
                        per_page: parseInt(e.target.value) || 10,
                      }))
                    }
                    min="1"
                    max="100"
                  />
                </div>
                <div>
                  <Label htmlFor="page">Page</Label>
                  <Input
                    id="page"
                    type="number"
                    value={query.page}
                    onChange={(e) =>
                      setQuery((prev) => ({
                        ...prev,
                        page: parseInt(e.target.value) || 1,
                      }))
                    }
                    min="1"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="debug"
                  checked={query.debug}
                  onCheckedChange={(checked) =>
                    setQuery((prev) => ({ ...prev, debug: checked }))
                  }
                />
                <Label htmlFor="debug">Enable debug mode</Label>
              </div>

              <Button
                onClick={handleSearch}
                disabled={isLoading || !query.collection || !query.nl_query.trim()}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Clock className="mr-2 h-4 w-4 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Run Search
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Search Results */}
        <div className="lg:col-span-2">
          {searchResults ? (
            <Tabs defaultValue="results" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="results">
                  Results ({searchResults.found})
                </TabsTrigger>
                <TabsTrigger value="parsed">
                  Parsed Query
                </TabsTrigger>
                <TabsTrigger value="debug">
                  Debug Info
                </TabsTrigger>
              </TabsList>

              <TabsContent value="results" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Search className="h-5 w-5" />
                        Search Results
                      </span>
                      <div className="flex gap-2">
                        <Badge variant="outline">
                          {searchResults.found} results
                        </Badge>
                        <Badge variant="outline">
                          {searchResults.search_time_ms}ms
                        </Badge>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {searchResults.hits.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">
                        No results found for your query.
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {searchResults.hits.map((hit, index) => (
                          <Card key={index} className="p-4">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-medium">
                                Document {(searchResults.page - 1) * searchResults.hits.length + index + 1}
                              </h4>
                              {hit.text_match && (
                                <Badge variant="secondary">
                                  Score: {hit.text_match.toFixed(2)}
                                </Badge>
                              )}
                            </div>
                            <pre className="text-sm bg-muted p-3 rounded overflow-auto max-h-40">
                              {JSON.stringify(hit.document, null, 2)}
                            </pre>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="parsed" className="space-y-4">
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
                    {searchResults.parsed_query ? (
                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm font-medium">Search Terms</Label>
                          <div className="mt-1 p-3 bg-muted rounded">
                            <code>{searchResults.parsed_query.query || 'N/A'}</code>
                          </div>
                        </div>
                        {searchResults.parsed_query.filter_by && (
                          <div>
                            <Label className="text-sm font-medium">Filters</Label>
                            <div className="mt-1 p-3 bg-muted rounded">
                              <code>{searchResults.parsed_query.filter_by}</code>
                            </div>
                          </div>
                        )}
                        {searchResults.parsed_query.sort_by && (
                          <div>
                            <Label className="text-sm font-medium">Sorting</Label>
                            <div className="mt-1 p-3 bg-muted rounded">
                              <code>{searchResults.parsed_query.sort_by}</code>
                            </div>
                          </div>
                        )}
                        {searchResults.parsed_query.facet_by && (
                          <div>
                            <Label className="text-sm font-medium">Facets</Label>
                            <div className="mt-1 p-3 bg-muted rounded">
                              <code>{searchResults.parsed_query.facet_by}</code>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No parsed query information available.</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="debug" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Eye className="h-5 w-5" />
                      Debug Information
                    </CardTitle>
                    <CardDescription>
                      Raw response from the AI model and additional metadata
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium">Request Parameters</Label>
                        <pre className="mt-1 text-xs bg-muted p-3 rounded overflow-auto max-h-40">
                          {JSON.stringify(searchResults.request_params, null, 2)}
                        </pre>
                      </div>
                      {searchResults.raw_llm_response && (
                        <div>
                          <Label className="text-sm font-medium">Raw LLM Response</Label>
                          <pre className="mt-1 text-xs bg-muted p-3 rounded overflow-auto max-h-40">
                            {searchResults.raw_llm_response}
                          </pre>
                        </div>
                      )}
                      {searchResults.facet_counts && searchResults.facet_counts.length > 0 && (
                        <div>
                          <Label className="text-sm font-medium">Facet Counts</Label>
                          <pre className="mt-1 text-xs bg-muted p-3 rounded overflow-auto max-h-40">
                            {JSON.stringify(searchResults.facet_counts, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Search className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Ready to Search</h3>
                <p className="text-muted-foreground text-center">
                  Configure your search parameters and run a natural language query to see results here.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
} 