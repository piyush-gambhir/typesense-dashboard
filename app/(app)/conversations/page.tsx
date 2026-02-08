'use client';

import { useEffect, useState } from 'react';

import { getCollections } from '@/lib/typesense/collections';

import { toast } from '@/hooks/use-toast';

import { LoadingSpinner } from '@/components/ui/loading';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import ConversationalSearch from '@/components/features/search/conversational-search';
import NLConversations from '@/components/features/search/nl-conversations';
import { VersionGate } from '@/components/shared/version-gate';

export default function ConversationsPage() {
    const [activeTab, setActiveTab] = useState('chat');
    const [collections, setCollections] = useState<string[]>([]);
    const [selectedCollection, setSelectedCollection] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchCollections = async () => {
            try {
                const result = await getCollections();
                if (result?.success && result.data) {
                    const names = result.data.map((c: any) => c.name);
                    setCollections(names);
                    if (names.length > 0) setSelectedCollection(names[0]);
                }
            } catch {
                toast({
                    title: 'Error',
                    description: 'Failed to load collections.',
                    variant: 'destructive',
                });
            } finally {
                setIsLoading(false);
            }
        };
        fetchCollections();
    }, []);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <VersionGate
            feature="conversationalSearch"
            featureName="Conversational Search (RAG)"
        >
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Conversational Search (RAG)
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Chat with your data using natural language, powered
                            by LLM models.
                        </p>
                    </div>
                    {activeTab === 'chat' && (
                        <Select
                            value={selectedCollection}
                            onValueChange={setSelectedCollection}
                        >
                            <SelectTrigger className="w-[200px]">
                                <SelectValue placeholder="Select collection" />
                            </SelectTrigger>
                            <SelectContent>
                                {collections.map((name) => (
                                    <SelectItem key={name} value={name}>
                                        {name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList>
                        <TabsTrigger value="chat">Chat</TabsTrigger>
                        <TabsTrigger value="history">Conversations</TabsTrigger>
                    </TabsList>

                    <TabsContent value="chat" className="mt-4">
                        {selectedCollection ? (
                            <ConversationalSearch
                                collectionName={selectedCollection}
                            />
                        ) : (
                            <p className="text-sm text-muted-foreground text-center py-8">
                                No collections available. Create a collection
                                first.
                            </p>
                        )}
                    </TabsContent>

                    <TabsContent value="history" className="mt-4">
                        <NLConversations />
                    </TabsContent>
                </Tabs>
            </div>
        </VersionGate>
    );
}
