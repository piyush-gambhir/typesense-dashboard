'use client';

import React, { useState, useEffect } from 'react';
import { Bot, Search, Settings, MessageSquare, Sparkles, Bug } from 'lucide-react';

import { naturalLanguageSearch, listNLSearchModels, type NLSearchModel } from '@/lib/typesense/nl-search-models';
import { deleteDocument } from '@/lib/typesense/documents';

import { useToast } from '@/hooks/useToast';
import { useDebounce } from '@/hooks/useDebounce';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

import DocumentCard from '@/components/features/documents/DocumentCard';
import PaginationComponent from '@/components/common/Pagination';
import TypesenseSearch from '@/components/features/search/TypesenseSearch';
import ConversationalSearch from '@/components/features/search/ConversationalSearch';

interface SearchResult {
  id: string;
  [key: string]: unknown;
}

interface NLSearchWrapperProps {
  collectionName: string;
}

export default function NLSearchWrapper({ collectionName }: NLSearchWrapperProps) {
  const { toast } = useToast();
  
  // Search mode: 'traditional' or 'natural' or 'conversational'
  const [searchMode, setSearchMode] = useState<'traditional' | 'natural' | 'conversational'>('traditional');
  
  // Natural Language Search state
  const [nlQuery, setNlQuery] = useState('');
  const [nlResults, setNlResults] = useState<SearchResult[]>([]);
  const [nlLoading, setNlLoading] = useState(false);
  const [nlError, setNlError] = useState<string | null>(null);
  const [nlTotalResults, setNlTotalResults] = useState(0);
  const [nlCurrentPage, setNlCurrentPage] = useState(1);
  const [nlPerPage, setNlPerPage] = useState(12);
  const [nlTotalPages, setNlTotalPages] = useState(1);
  
  // NL Search settings
  const [availableModels, setAvailableModels] = useState<NLSearchModel[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [debugMode, setDebugMode] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // Debug information
  const [debugInfo, setDebugInfo] = useState<any>(null);

  const debouncedNlQuery = useDebounce(nlQuery, 500);

  useEffect(() => {
    loadAvailableModels();
  }, []);

  useEffect(() => {
    if (searchMode === 'natural' && debouncedNlQuery.trim()) {
      performNaturalLanguageSearch();
    } else if (searchMode === 'natural' && !debouncedNlQuery.trim()) {
      setNlResults([]);
      setNlTotalResults(0);
      setNlTotalPages(1);
      setDebugInfo(null);
    }
  }, [debouncedNlQuery, nlCurrentPage, nlPerPage, selectedModel, debugMode]);

  const loadAvailableModels = async () => {
    try {
      const result = await listNLSearchModels();
      if (result.success && result.data) {
        setAvailableModels(result.data);
        // Set default model if available
        const defaultModel = result.data.find(m => 
          m.collections?.includes(collectionName) || 
          (m.model_config?.collections && m.model_config.collections.includes(collectionName))
        );
        if (defaultModel) {
          setSelectedModel(defaultModel.id);
        }
      }
    } catch (error) {
      console.error('Failed to load NL search models:', error);
    }
  };

  const performNaturalLanguageSearch = async () => {
    if (!nlQuery.trim()) return;

    setNlLoading(true);
    setNlError(null);
    setDebugInfo(null);

    try {
      const result = await naturalLanguageSearch({
        collection: collectionName,
        nl_query: nlQuery.trim(),
        page: nlCurrentPage,
        per_page: nlPerPage,
        model_id: selectedModel || undefined,
        debug: debugMode,
      });

      if (result.success && result.data) {
        const hits = result.data.hits || [];
        setNlResults(hits.map(hit => hit.document as SearchResult));
        setNlTotalResults(result.data.found || 0);
        setNlTotalPages(Math.ceil((result.data.found || 0) / nlPerPage));
        
        if (debugMode) {
          setDebugInfo({
            parsed_query: result.data.parsed_query,
            raw_llm_response: result.data.raw_llm_response,
            search_time_ms: result.data.search_time_ms,
            request_params: result.data.request_params,
          });
        }

        toast({
          title: 'Search Complete',
          description: `Found ${result.data.found} results in ${result.data.search_time_ms}ms`,
        });
      } else {
        setNlError(result.error || 'Failed to perform natural language search');
        setNlResults([]);
        setNlTotalResults(0);
        setNlTotalPages(1);
      }
    } catch (error) {
      console.error('Natural language search error:', error);
      setNlError('Failed to perform search');
      setNlResults([]);
      setNlTotalResults(0);
      setNlTotalPages(1);
    } finally {
      setNlLoading(false);
    }
  };

  const handleNlPageChange = (page: number) => {
    setNlCurrentPage(page);
  };

  const handleNlPerPageChange = (perPage: number) => {
    setNlPerPage(perPage);
    setNlCurrentPage(1);
  };

  const handleDeleteDocument = async (documentId: string) => {
    try {
      await deleteDocument(collectionName, documentId);
      // Refresh search results
      if (searchMode === 'natural' && nlQuery.trim()) {
        performNaturalLanguageSearch();
      }
      toast({
        title: 'Success',
        description: 'Document deleted successfully.',
      });
    } catch (error) {
      console.error('Error deleting document:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete document.',
        variant: 'destructive',
      });
    }
  };

  const renderNaturalLanguageSearch = () => (
    <div className="p-4 md:p-8 flex flex-col gap-y-4">
      <Card className="border-none shadow-none">
        <CardContent>
          {/* Search Bar */}
          <div className="mb-6">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Sparkles className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary h-4 w-4" />
                <Input
                  type="text"
                  value={nlQuery}
                  onChange={(e) => setNlQuery(e.target.value)}
                  placeholder="Ask in natural language: 'Show me recent high-rated products under $50'"
                  className="pl-10"
                />
              </div>
              <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Settings className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Natural Language Search Settings</DialogTitle>
                    <DialogDescription>
                      Configure your AI-powered search preferences
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="model">AI Model</Label>
                      <Select value={selectedModel} onValueChange={setSelectedModel}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a model" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Default Model</SelectItem>
                          {availableModels
                            .filter(m => 
                              m.collections?.includes(collectionName) || 
                              (m.model_config?.collections && m.model_config.collections.includes(collectionName))
                            )
                            .map((model) => (
                              <SelectItem key={model.id} value={model.id}>
                                {model.name || model.id} ({model.model_name || model.model_type})
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="debug"
                        checked={debugMode}
                        onCheckedChange={setDebugMode}
                      />
                      <Label htmlFor="debug">Enable debug mode</Label>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            
            <div className="mt-2 flex items-center gap-2">
              <Badge variant="secondary">
                <Bot className="h-3 w-3 mr-1" />
                AI-Powered Search
              </Badge>
              {selectedModel && (
                <Badge variant="outline">Model: {selectedModel}</Badge>
              )}
              {debugMode && (
                <Badge variant="outline">
                  <Bug className="h-3 w-3 mr-1" />
                  Debug Mode
                </Badge>
              )}
            </div>
          </div>

          {/* Error Display */}
          {nlError && (
            <Alert className="mb-4">
              <AlertDescription className="flex items-center justify-between">
                <span>{nlError}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => performNaturalLanguageSearch()}
                >
                  Retry
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Debug Information */}
          {debugMode && debugInfo && (
            <Alert className="mb-4">
              <AlertDescription>
                <div className="space-y-2 text-sm">
                  <div className="font-medium">Debug Information:</div>
                  {debugInfo.parsed_query && (
                    <div>
                      <strong>Parsed Query:</strong> {JSON.stringify(debugInfo.parsed_query)}
                    </div>
                  )}
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    <span>Search Time: {debugInfo.search_time_ms}ms</span>
                    {debugInfo.request_params && (
                      <span>Parameters: {Object.keys(debugInfo.request_params).length}</span>
                    )}
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-12">
            <div className="col-span-1">
              {/* Empty space for consistency with traditional search layout */}
              <div className="text-center text-gray-500 py-4">
                <Sparkles className="h-8 w-8 mx-auto mb-2 text-primary" />
                <p className="text-sm">AI Search</p>
                <p className="text-xs text-muted-foreground">
                  Natural language queries
                </p>
              </div>
            </div>

            <div className="lg:col-span-4 flex flex-col gap-y-8">
              <div className="flex flex-col sm:flex-row justify-end items-start sm:items-center mb-4 gap-4">
                <Select
                  value={nlPerPage.toString()}
                  onValueChange={(value) => handleNlPerPageChange(parseInt(value))}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue>Results per page</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="12">12 per page</SelectItem>
                    <SelectItem value="24">24 per page</SelectItem>
                    <SelectItem value="48">48 per page</SelectItem>
                    <SelectItem value="96">96 per page</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {nlLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Card key={i} className="w-full flex flex-col justify-between">
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          <div className="mb-4">
                            <div className="h-4 w-16 mb-2 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                            <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                          </div>
                          {[1, 2, 3].map((j) => (
                            <div key={j} className="mb-4">
                              <div className="h-4 w-20 mb-2 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                              <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <>
                  {nlResults.length === 0 && nlQuery.trim() ? (
                    <div className="text-center text-gray-500 py-8">
                      No results found. Try rephrasing your question.
                    </div>
                  ) : nlResults.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      Ask questions in plain English about your {collectionName} collection.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {nlResults.map((result) => (
                        <DocumentCard
                          key={result.id}
                          result={result}
                          collectionName={collectionName}
                          onEdit={() => {}}
                          onDelete={handleDeleteDocument}
                        />
                      ))}
                    </div>
                  )}

                  {nlTotalResults > 0 && (
                    <PaginationComponent
                      currentPage={nlCurrentPage}
                      totalPages={nlTotalPages}
                      onPageChange={handleNlPageChange}
                    />
                  )}
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="p-4 md:p-8 flex flex-col gap-y-4">
      {/* Mode Selector */}
      <Card className="border-none shadow-none">
        <CardContent className="p-4">
          <Tabs value={searchMode} onValueChange={(value) => setSearchMode(value as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="traditional" className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                Traditional Search
              </TabsTrigger>
              <TabsTrigger value="natural" className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Natural Language
              </TabsTrigger>
              <TabsTrigger value="conversational" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Conversational
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      {/* Search Interface */}
      {searchMode === 'traditional' && (
        <TypesenseSearch collectionName={collectionName} />
      )}
      
      {searchMode === 'natural' && renderNaturalLanguageSearch()}
      
      {searchMode === 'conversational' && (
        <div className="p-4 md:p-8 flex flex-col gap-y-4">
          <Card className="border-none shadow-none">
            <CardContent>
              <ConversationalSearch 
                collectionName={collectionName}
                onConversationChange={() => {}}
              />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}