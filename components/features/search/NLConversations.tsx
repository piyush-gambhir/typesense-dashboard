'use client';

import { formatDistanceToNow } from 'date-fns';
import {
    Download,
    MessageSquare,
    RotateCcw,
    Search,
    Trash2,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

import {
    type Conversation,
    clearConversationHistory,
    deleteConversation,
    exportConversation,
    listConversations,
} from '@/lib/typesense/conversations';

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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

interface NLConversationsProps {
    collectionName?: string;
    onSelectConversation?: (conversation: Conversation) => void;
}

export default function NLConversations({
    collectionName,
    onSelectConversation,
}: NLConversationsProps) {
    const { toast } = useToast();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCollection, setSelectedCollection] = useState<string>(
        collectionName || 'all',
    );
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isClearHistoryDialogOpen, setIsClearHistoryDialogOpen] =
        useState(false);
    const [conversationToDelete, setConversationToDelete] =
        useState<Conversation | null>(null);
    const [conversationToClear, setConversationToClear] =
        useState<Conversation | null>(null);

    const fetchConversations = async () => {
        setLoading(true);
        try {
            const params =
                selectedCollection !== 'all'
                    ? { collection_name: selectedCollection }
                    : undefined;
            const result = await listConversations(params);

            if (result.success && result.data) {
                setConversations(result.data);
            } else {
                toast({
                    title: 'Error',
                    description:
                        result.error || 'Failed to load conversations.',
                    variant: 'destructive',
                });
            }
        } catch {
            toast({
                title: 'Error',
                description: 'Failed to load conversations.',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchConversations();
    }, [fetchConversations]);

    useEffect(() => {
        if (collectionName) {
            setSelectedCollection(collectionName);
        }
    }, [collectionName]);

    const handleDelete = (conversation: Conversation) => {
        setConversationToDelete(conversation);
        setIsDeleteDialogOpen(true);
    };

    const handleClearHistory = (conversation: Conversation) => {
        setConversationToClear(conversation);
        setIsClearHistoryDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!conversationToDelete) return;

        try {
            const result = await deleteConversation(conversationToDelete.id);
            if (result.success) {
                toast({
                    title: 'Success',
                    description: 'Conversation deleted successfully.',
                });
                fetchConversations();
            } else {
                toast({
                    title: 'Error',
                    description:
                        result.error || 'Failed to delete conversation.',
                    variant: 'destructive',
                });
            }
        } catch {
            toast({
                title: 'Error',
                description: 'Failed to delete conversation.',
                variant: 'destructive',
            });
        } finally {
            setIsDeleteDialogOpen(false);
            setConversationToDelete(null);
        }
    };

    const confirmClearHistory = async () => {
        if (!conversationToClear) return;

        try {
            const result = await clearConversationHistory(
                conversationToClear.id,
            );
            if (result.success) {
                toast({
                    title: 'Success',
                    description: 'Conversation history cleared successfully.',
                });
                fetchConversations();
            } else {
                toast({
                    title: 'Error',
                    description:
                        result.error || 'Failed to clear conversation history.',
                    variant: 'destructive',
                });
            }
        } catch {
            toast({
                title: 'Error',
                description: 'Failed to clear conversation history.',
                variant: 'destructive',
            });
        } finally {
            setIsClearHistoryDialogOpen(false);
            setConversationToClear(null);
        }
    };

    const handleExport = async (
        conversation: Conversation,
        format: 'json' | 'csv' | 'txt',
    ) => {
        try {
            const result = await exportConversation(conversation.id, format);
            if (result.success && result.data) {
                // Create download link
                const dataStr =
                    typeof result.data === 'string'
                        ? result.data
                        : JSON.stringify(result.data, null, 2);
                const dataBlob = new Blob([dataStr], {
                    type: getContentType(format),
                });
                const url = window.URL.createObjectURL(dataBlob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `conversation-${conversation.id}.${format}`;
                link.click();
                window.URL.revokeObjectURL(url);

                toast({
                    title: 'Success',
                    description: `Conversation exported as ${format.toUpperCase()}.`,
                });
            } else {
                toast({
                    title: 'Error',
                    description:
                        result.error || 'Failed to export conversation.',
                    variant: 'destructive',
                });
            }
        } catch {
            toast({
                title: 'Error',
                description: 'Failed to export conversation.',
                variant: 'destructive',
            });
        }
    };

    const getContentType = (format: string) => {
        switch (format) {
            case 'json':
                return 'application/json';
            case 'csv':
                return 'text/csv';
            case 'txt':
                return 'text/plain';
            default:
                return 'text/plain';
        }
    };

    const filteredConversations = conversations.filter(
        (conversation) =>
            searchQuery === '' ||
            conversation.title
                ?.toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
            conversation.collection_name
                .toLowerCase()
                .includes(searchQuery.toLowerCase()),
    );

    const getUniqueCollections = () => {
        const collections = [
            ...new Set(conversations.map((c) => c.collection_name)),
        ];
        return collections.sort();
    };

    if (loading) {
        return (
            <div className="container mx-auto p-8">
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-8 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <MessageSquare className="h-8 w-8" />
                        NL Search Conversations
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Manage your natural language search conversations and
                        chat history
                    </p>
                </div>
                <Button onClick={() => fetchConversations()}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Refresh
                </Button>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                <Input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                    placeholder="Search conversations..."
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <div className="w-full sm:w-48">
                            <Select
                                value={selectedCollection}
                                onValueChange={setSelectedCollection}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="All collections" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        All collections
                                    </SelectItem>
                                    {getUniqueCollections().map(
                                        (collection) => (
                                            <SelectItem
                                                key={collection}
                                                value={collection}
                                            >
                                                {collection}
                                            </SelectItem>
                                        ),
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {filteredConversations.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">
                            No Conversations Found
                        </h3>
                        <p className="text-muted-foreground text-center mb-4">
                            {searchQuery || selectedCollection !== 'all'
                                ? 'No conversations match your current filters.'
                                : 'Start a natural language search to create your first conversation.'}
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <Card>
                    <CardHeader>
                        <CardTitle>
                            Conversations ({filteredConversations.length})
                        </CardTitle>
                        <CardDescription>
                            View and manage your natural language search
                            conversations
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Collection</TableHead>
                                    <TableHead>Messages</TableHead>
                                    <TableHead>Last Activity</TableHead>
                                    <TableHead>Model</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredConversations.map((conversation) => (
                                    <TableRow
                                        key={conversation.id}
                                        className="cursor-pointer hover:bg-muted/50"
                                        onClick={() =>
                                            onSelectConversation?.(conversation)
                                        }
                                    >
                                        <TableCell>
                                            <div>
                                                <div className="font-medium">
                                                    {conversation.title ||
                                                        `Conversation ${conversation.id.slice(0, 8)}`}
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    ID: {conversation.id}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">
                                                {conversation.collection_name}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <span>
                                                    {
                                                        conversation.messages
                                                            .length
                                                    }
                                                </span>
                                                {conversation.metadata
                                                    ?.total_searches && (
                                                    <Badge
                                                        variant="secondary"
                                                        className="text-xs"
                                                    >
                                                        {
                                                            conversation
                                                                .metadata
                                                                .total_searches
                                                        }{' '}
                                                        searches
                                                    </Badge>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {conversation.updated_at
                                                ? formatDistanceToNow(
                                                      new Date(
                                                          conversation.updated_at *
                                                              1000,
                                                      ),
                                                      { addSuffix: true },
                                                  )
                                                : 'Unknown'}
                                        </TableCell>
                                        <TableCell>
                                            {conversation.model_id ? (
                                                <Badge variant="outline">
                                                    {conversation.model_id}
                                                </Badge>
                                            ) : (
                                                <span className="text-muted-foreground">
                                                    Default
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                    >
                                                        •••
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem
                                                        onClick={() =>
                                                            onSelectConversation?.(
                                                                conversation,
                                                            )
                                                        }
                                                    >
                                                        <MessageSquare className="h-4 w-4 mr-2" />
                                                        Open Chat
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        onClick={() =>
                                                            handleExport(
                                                                conversation,
                                                                'json',
                                                            )
                                                        }
                                                    >
                                                        <Download className="h-4 w-4 mr-2" />
                                                        Export JSON
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() =>
                                                            handleExport(
                                                                conversation,
                                                                'csv',
                                                            )
                                                        }
                                                    >
                                                        <Download className="h-4 w-4 mr-2" />
                                                        Export CSV
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() =>
                                                            handleExport(
                                                                conversation,
                                                                'txt',
                                                            )
                                                        }
                                                    >
                                                        <Download className="h-4 w-4 mr-2" />
                                                        Export Text
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        onClick={() =>
                                                            handleClearHistory(
                                                                conversation,
                                                            )
                                                        }
                                                    >
                                                        <RotateCcw className="h-4 w-4 mr-2" />
                                                        Clear History
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() =>
                                                            handleDelete(
                                                                conversation,
                                                            )
                                                        }
                                                        className="text-destructive focus:text-destructive"
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-2" />
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Conversation</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete the conversation
                            &quot;
                            {conversationToDelete?.title ||
                                conversationToDelete?.id}
                            &quot;? This action cannot be undone and will
                            permanently remove all messages.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsDeleteDialogOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={confirmDelete}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Clear History Confirmation Dialog */}
            <Dialog
                open={isClearHistoryDialogOpen}
                onOpenChange={setIsClearHistoryDialogOpen}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Clear Conversation History</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to clear the history for
                            &quot;
                            {conversationToClear?.title ||
                                conversationToClear?.id}
                            &quot;? This will remove all messages but keep the
                            conversation. This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsClearHistoryDialogOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={confirmClearHistory}
                        >
                            Clear History
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
