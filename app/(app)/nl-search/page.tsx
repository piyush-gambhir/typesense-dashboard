import React from 'react';
import { Metadata } from 'next';
import { Brain, MessageSquare, Settings, BookOpen } from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import NLSearchModels from '@/components/features/search/NLSearchModels';
import NLConversations from '@/components/features/search/NLConversations';

export const metadata: Metadata = {
  title: 'Natural Language Search | Typesense Dashboard',
  description: 'Manage AI models and conversations for natural language search',
};

export default function NaturalLanguageSearchPage() {
  return (
    <div className="container mx-auto p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold flex items-center gap-3 mb-4">
          <Brain className="h-10 w-10 text-primary" />
          Natural Language Search
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl">
          Configure AI models and manage conversations for intelligent, natural language 
          search capabilities across your Typesense collections.
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Brain className="h-5 w-5" />
              AI Models
            </CardTitle>
            <CardDescription>
              Configure language models for natural language understanding
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div>• OpenAI GPT models</div>
              <div>• Anthropic Claude models</div>
              <div>• Google Cloud Gemini</div>
              <div>• Cloudflare Workers AI</div>
              <div>• Self-hosted vLLM models</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Conversations
            </CardTitle>
            <CardDescription>
              Maintain context across multiple search interactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div>• Context-aware searches</div>
              <div>• Conversation history</div>
              <div>• Export capabilities</div>
              <div>• Cross-collection support</div>
              <div>• Performance analytics</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Advanced Features
            </CardTitle>
            <CardDescription>
              Debug and optimize your natural language search
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div>• Query parsing insights</div>
              <div>• LLM response debugging</div>
              <div>• Performance monitoring</div>
              <div>• Custom system prompts</div>
              <div>• Multi-search support</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardContent className="p-6">
          <Tabs defaultValue="models" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="models" className="flex items-center gap-2">
                <Brain className="h-4 w-4" />
                AI Models
              </TabsTrigger>
              <TabsTrigger value="conversations" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Conversations
              </TabsTrigger>
              <TabsTrigger value="documentation" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Documentation
              </TabsTrigger>
            </TabsList>

            <TabsContent value="models" className="space-y-6">
              <NLSearchModels />
            </TabsContent>

            <TabsContent value="conversations" className="space-y-6">
              <NLConversations />
            </TabsContent>

            <TabsContent value="documentation" className="space-y-6">
              <div className="grid gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Getting Started</CardTitle>
                    <CardDescription>
                      Learn how to set up and use natural language search
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">1. Configure AI Models</h4>
                      <p className="text-sm text-muted-foreground">
                        Create and configure AI models with your API keys. Choose from OpenAI, 
                        Anthropic, Google Cloud, or self-hosted options.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">2. Assign to Collections</h4>
                      <p className="text-sm text-muted-foreground">
                        Associate your AI models with specific collections to enable 
                        natural language search for those datasets.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">3. Start Searching</h4>
                      <p className="text-sm text-muted-foreground">
                        Use natural language queries in your collection search interfaces. 
                        Enable conversational mode for context-aware interactions.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Supported Model Types</CardTitle>
                    <CardDescription>
                      Compatible AI providers and their configuration requirements
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div className="border rounded-lg p-3">
                          <h4 className="font-semibold text-sm">OpenAI</h4>
                          <p className="text-xs text-muted-foreground">
                            GPT-3.5, GPT-4, GPT-4 Turbo, GPT-4o models
                          </p>
                          <p className="text-xs mt-1">Requires: API Key</p>
                        </div>
                        <div className="border rounded-lg p-3">
                          <h4 className="font-semibold text-sm">Anthropic</h4>
                          <p className="text-xs text-muted-foreground">
                            Claude 3 Haiku, Sonnet, Opus, and 3.5 Sonnet
                          </p>
                          <p className="text-xs mt-1">Requires: API Key</p>
                        </div>
                        <div className="border rounded-lg p-3">
                          <h4 className="font-semibold text-sm">Google Cloud</h4>
                          <p className="text-xs text-muted-foreground">
                            Gemini Pro, Gemini 1.5 Pro/Flash
                          </p>
                          <p className="text-xs mt-1">Requires: Project ID, Region, API Key</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="border rounded-lg p-3">
                          <h4 className="font-semibold text-sm">Cloudflare Workers AI</h4>
                          <p className="text-xs text-muted-foreground">
                            Llama 2, Mistral, Phi-2 models
                          </p>
                          <p className="text-xs mt-1">Requires: Account ID, API Token</p>
                        </div>
                        <div className="border rounded-lg p-3">
                          <h4 className="font-semibold text-sm">vLLM (Self-hosted)</h4>
                          <p className="text-xs text-muted-foreground">
                            Custom models via vLLM API
                          </p>
                          <p className="text-xs mt-1">Requires: API Base URL</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Query Examples</CardTitle>
                    <CardDescription>
                      Example natural language queries and their capabilities
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="border-l-4 border-primary pl-4">
                        <h4 className="font-semibold text-sm">E-commerce</h4>
                        <p className="text-sm text-muted-foreground">
                          &ldquo;Show me red shirts under $50 with high ratings&rdquo;
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Automatically extracts color, price range, and rating filters
                        </p>
                      </div>
                      <div className="border-l-4 border-primary pl-4">
                        <h4 className="font-semibold text-sm">Content</h4>
                        <p className="text-sm text-muted-foreground">
                          &ldquo;Find recent articles about machine learning from last month&rdquo;
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Combines topic matching with date range filtering
                        </p>
                      </div>
                      <div className="border-l-4 border-primary pl-4">
                        <h4 className="font-semibold text-sm">Support</h4>
                        <p className="text-sm text-muted-foreground">
                          &ldquo;Show urgent tickets about billing issues&rdquo;
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Filters by priority level and issue category
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}