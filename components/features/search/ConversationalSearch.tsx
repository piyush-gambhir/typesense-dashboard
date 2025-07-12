'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, MessageSquare, Settings, Trash2 } from 'lucide-react';

import {
  createConversation,
  conversationSearch,
  getConversation,
  addMessageToConversation,
  type Conversation,
  type ConversationMessage,
  type ConversationSearchResponse,
} from '@/lib/typesense/conversations';
import { listNLSearchModels, type NLSearchModel } from '@/lib/typesense/nl-search-models';

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
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';

import DocumentCard from '@/components/features/documents/DocumentCard';

interface ConversationalSearchProps {
  collectionName: string;
  conversation?: Conversation | null;
  onConversationChange?: (conversation: Conversation) => void;
}

interface ChatMessage extends ConversationMessage {
  id: string;
  searchResults?: any[];
  llmResponse?: ConversationSearchResponse['llm_response'];
  isSearching?: boolean;
}

export default function ConversationalSearch({
  collectionName,
  conversation: initialConversation,
  onConversationChange,
}: ConversationalSearchProps) {
  const { toast } = useToast();
  const [conversation, setConversation] = useState<Conversation | null>(initialConversation || null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [availableModels, setAvailableModels] = useState<NLSearchModel[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    loadAvailableModels();
  }, []);

  useEffect(() => {
    if (initialConversation) {
      setConversation(initialConversation);
      loadConversationMessages(initialConversation);
    }
  }, [initialConversation]);

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

  const loadConversationMessages = async (conv: Conversation) => {
    try {
      const result = await getConversation(conv.id);
      if (result.success && result.data) {
        const chatMessages: ChatMessage[] = result.data.messages.map((msg, index) => ({
          ...msg,
          id: `${conv.id}-${index}`,
        }));
        setMessages(chatMessages);
      }
    } catch (error) {
      console.error('Failed to load conversation messages:', error);
    }
  };

  const createNewConversation = async () => {
    try {
      const result = await createConversation({
        collection_name: collectionName,
        model_id: selectedModel || undefined,
        title: `Search in ${collectionName}`,
      });

      if (result.success && result.data) {
        setConversation(result.data);
        setMessages([]);
        onConversationChange?.(result.data);
        return result.data;
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to create conversation.',
          variant: 'destructive',
        });
        return null;
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create conversation.',
        variant: 'destructive',
      });
      return null;
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    let currentConversation = conversation;
    
    // Create conversation if it doesn't exist
    if (!currentConversation) {
      currentConversation = await createNewConversation();
      if (!currentConversation) return;
    }

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: inputMessage.trim(),
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsSearching(true);

    // Add searching placeholder
    const searchingMessage: ChatMessage = {
      id: `searching-${Date.now()}`,
      role: 'assistant',
      content: 'Searching...',
      timestamp: Date.now(),
      isSearching: true,
    };
    setMessages(prev => [...prev, searchingMessage]);

    try {
      const searchResult = await conversationSearch({
        conversation_id: currentConversation.id,
        message: inputMessage.trim(),
        collection: collectionName,
        model_id: selectedModel || undefined,
        include_context: true,
        context_window: 5,
      });

      if (searchResult.success && searchResult.data) {
        const assistantMessage: ChatMessage = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: searchResult.data.llm_response.content,
          timestamp: Date.now(),
          searchResults: searchResult.data.search_results.hits?.map(hit => hit.document) || [],
          llmResponse: searchResult.data.llm_response,
        };

        // Remove searching message and add real response
        setMessages(prev => prev.filter(msg => !msg.isSearching).concat([assistantMessage]));

        toast({
          title: 'Search Complete',
          description: `Found ${searchResult.data.search_results.found} results in ${searchResult.data.search_results.search_time_ms}ms`,
        });
      } else {
        // Remove searching message and show error
        setMessages(prev => prev.filter(msg => !msg.isSearching));
        toast({
          title: 'Search Failed',
          description: searchResult.error || 'Failed to perform search.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      // Remove searching message and show error
      setMessages(prev => prev.filter(msg => !msg.isSearching));
      toast({
        title: 'Error',
        description: 'Failed to perform conversational search.',
        variant: 'destructive',
      });
    } finally {
      setIsSearching(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearConversation = () => {
    setMessages([]);
    setConversation(null);
    onConversationChange?.(null);
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="flex flex-col gap-y-4">
      {/* Header and Settings */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-medium">Conversational Search</h3>
          <p className="text-sm text-muted-foreground">
            {conversation 
              ? `Chat with ${collectionName} collection`
              : `Start a conversation to search ${collectionName}`
            }
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Search Settings</DialogTitle>
                <DialogDescription>
                  Configure your conversational search preferences
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
                  <input
                    type="checkbox"
                    id="debug"
                    checked={debugMode}
                    onChange={(e) => setDebugMode(e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor="debug">Enable debug mode</Label>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          {messages.length > 0 && (
            <Button variant="outline" size="sm" onClick={clearConversation}>
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      
      {conversation && (
        <div className="flex items-center gap-2 mb-4">
          <Badge variant="outline">ID: {conversation.id.slice(0, 8)}</Badge>
          {selectedModel && (
            <Badge variant="secondary">Model: {selectedModel}</Badge>
          )}
          <Badge variant="outline">{messages.length} messages</Badge>
        </div>
      )}

      {/* Messages */}
      <div className="border rounded-lg min-h-[400px] max-h-[600px] overflow-hidden">
        <ScrollArea className="h-full p-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Start a Conversation</h3>
              <p className="text-muted-foreground mb-4 max-w-md">
                Ask questions about your {collectionName} collection using natural language. 
                The AI will help you find and understand your data.
              </p>
              <Badge variant="outline">
                Try: "Show me recent documents" or "Find items with high ratings"
              </Badge>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id} className="flex gap-3">
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    message.role === 'user' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted'
                  }`}>
                    {message.role === 'user' ? (
                      <User className="h-4 w-4" />
                    ) : message.isSearching ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Bot className="h-4 w-4" />
                    )}
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">
                        {message.role === 'user' ? 'You' : 'AI Assistant'}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatTimestamp(message.timestamp)}
                      </span>
                    </div>
                    
                    <div className="text-sm">
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    </div>

                    {/* Debug Information */}
                    {debugMode && message.llmResponse && (
                      <div className="mt-2 p-2 bg-muted rounded text-xs">
                        <div className="font-medium mb-1">Debug Info:</div>
                        {message.llmResponse.parsed_query && (
                          <div>
                            <strong>Parsed Query:</strong> {JSON.stringify(message.llmResponse.parsed_query)}
                          </div>
                        )}
                        {message.llmResponse.processing_time_ms && (
                          <div>
                            <strong>Time:</strong> {message.llmResponse.processing_time_ms}ms
                          </div>
                        )}
                      </div>
                    )}

                    {/* Search Results */}
                    {message.searchResults && message.searchResults.length > 0 && (
                      <div className="mt-3">
                        <div className="text-xs font-medium mb-2 text-muted-foreground">
                          Found {message.searchResults.length} results:
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {message.searchResults.slice(0, 4).map((result, index) => (
                            <DocumentCard
                              key={`${message.id}-result-${index}`}
                              result={result}
                              collectionName={collectionName}
                              onEdit={() => {}}
                              onDelete={() => {}}
                            />
                          ))}
                        </div>
                        {message.searchResults.length > 4 && (
                          <div className="mt-2 text-xs text-muted-foreground">
                            And {message.searchResults.length - 4} more results...
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <Input
          ref={inputRef}
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask a question about your data..."
          disabled={isSearching}
          className="flex-1"
        />
        <Button 
          onClick={handleSendMessage} 
          disabled={!inputMessage.trim() || isSearching}
          size="icon"
        >
          {isSearching ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}