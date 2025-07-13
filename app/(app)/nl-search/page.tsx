import {
    AlertCircle,
    BookOpen,
    Brain,
    MessageSquare,
    Settings,
} from 'lucide-react';
import { Metadata } from 'next';
import React from 'react';

import { checkTypesenseConnection } from '@/lib/typesense/connection-check';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import NLConversations from '@/components/features/search/nl-conversations';
import NLSearchModels from '@/components/features/search/nl-search-models';

export const metadata: Metadata = {
    title: 'Natural Language Search | Typesense Dashboard',
    description:
        'Manage AI models and conversations for natural language search',
};

export default async function NaturalLanguageSearchPage() {
    // Check connection first
    const connectionStatus = await checkTypesenseConnection();

    if (!connectionStatus.isConnected) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-2xl mx-auto">
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Connection Error</AlertTitle>
                        <AlertDescription>
                            Unable to connect to Typesense server. Please check
                            your configuration and try again. Error:{' '}
                            {connectionStatus.error}
                        </AlertDescription>
                    </Alert>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                        <Brain className="h-8 w-8 text-primary" />
                        Natural Language Search
                    </h1>
                    <p className="text-muted-foreground max-w-3xl">
                        Configure AI models and manage conversations for
                        intelligent, natural language search capabilities across
                        your Typesense collections.
                    </p>
                </div>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="relative overflow-hidden transition-all hover:shadow-md">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Brain className="h-5 w-5 text-primary" />
                            AI Models
                        </CardTitle>
                        <CardDescription>
                            Configure language models for natural language
                            understanding
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

                <Card className="relative overflow-hidden transition-all hover:shadow-md">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <MessageSquare className="h-5 w-5 text-primary" />
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

                <Card className="relative overflow-hidden transition-all hover:shadow-md">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Settings className="h-5 w-5 text-primary" />
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
            <Card className="relative overflow-hidden transition-all hover:shadow-md">
                <CardContent className="p-6">
                    <Tabs defaultValue="models" className="space-y-6">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger
                                value="models"
                                className="flex items-center gap-2"
                            >
                                <Brain className="h-4 w-4" />
                                AI Models
                            </TabsTrigger>
                            <TabsTrigger
                                value="conversations"
                                className="flex items-center gap-2"
                            >
                                <MessageSquare className="h-4 w-4" />
                                Conversations
                            </TabsTrigger>
                            <TabsTrigger
                                value="documentation"
                                className="flex items-center gap-2"
                            >
                                <BookOpen className="h-4 w-4" />
                                Documentation
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="models" className="space-y-6">
                            <NLSearchModels />
                        </TabsContent>

                        <TabsContent
                            value="conversations"
                            className="space-y-6"
                        >
                            <NLConversations />
                        </TabsContent>

                        <TabsContent
                            value="documentation"
                            className="space-y-6"
                        >
                            <div className="grid gap-6">
                                <Card className="relative overflow-hidden transition-all hover:shadow-md">
                                    <CardHeader>
                                        <CardTitle>Getting Started</CardTitle>
                                        <CardDescription>
                                            Learn how to set up and use natural
                                            language search
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <h4 className="font-semibold mb-2">
                                                1. Configure AI Models
                                            </h4>
                                            <p className="text-sm text-muted-foreground">
                                                Create and configure AI models
                                                with your API keys. Choose from
                                                OpenAI, Anthropic, Google Cloud,
                                                or self-hosted options.
                                            </p>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold mb-2">
                                                2. Assign to Collections
                                            </h4>
                                            <p className="text-sm text-muted-foreground">
                                                Associate your AI models with
                                                specific collections to enable
                                                natural language search for
                                                those datasets.
                                            </p>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold mb-2">
                                                3. Start Searching
                                            </h4>
                                            <p className="text-sm text-muted-foreground">
                                                Use natural language queries in
                                                your collection search
                                                interfaces. Enable
                                                conversational mode for
                                                context-aware interactions.
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="relative overflow-hidden transition-all hover:shadow-md">
                                    <CardHeader>
                                        <CardTitle>
                                            Supported Model Types
                                        </CardTitle>
                                        <CardDescription>
                                            Compatible AI providers and their
                                            configuration requirements
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-3">
                                                <div className="border rounded-lg p-3">
                                                    <h4 className="font-semibold text-sm">
                                                        OpenAI
                                                    </h4>
                                                    <p className="text-xs text-muted-foreground">
                                                        GPT-3.5, GPT-4, GPT-4
                                                        Turbo, GPT-4o models
                                                    </p>
                                                    <p className="text-xs mt-1">
                                                        Requires: API Key
                                                    </p>
                                                </div>
                                                <div className="border rounded-lg p-3">
                                                    <h4 className="font-semibold text-sm">
                                                        Anthropic
                                                    </h4>
                                                    <p className="text-xs text-muted-foreground">
                                                        Claude 3 Haiku, Sonnet,
                                                        Opus, and 3.5 Sonnet
                                                    </p>
                                                    <p className="text-xs mt-1">
                                                        Requires: API Key
                                                    </p>
                                                </div>
                                                <div className="border rounded-lg p-3">
                                                    <h4 className="font-semibold text-sm">
                                                        Google Cloud
                                                    </h4>
                                                    <p className="text-xs text-muted-foreground">
                                                        Gemini Pro, Gemini 1.5
                                                        Pro/Flash
                                                    </p>
                                                    <p className="text-xs mt-1">
                                                        Requires: Project ID,
                                                        Region, API Key
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                <div className="border rounded-lg p-3">
                                                    <h4 className="font-semibold text-sm">
                                                        Cloudflare Workers AI
                                                    </h4>
                                                    <p className="text-xs text-muted-foreground">
                                                        Llama 2, Mistral, and
                                                        other open models
                                                    </p>
                                                    <p className="text-xs mt-1">
                                                        Requires: Account Token
                                                    </p>
                                                </div>
                                                <div className="border rounded-lg p-3">
                                                    <h4 className="font-semibold text-sm">
                                                        vLLM (Self-hosted)
                                                    </h4>
                                                    <p className="text-xs text-muted-foreground">
                                                        Local deployment of
                                                        open-source models
                                                    </p>
                                                    <p className="text-xs mt-1">
                                                        Requires: Server URL
                                                    </p>
                                                </div>
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
