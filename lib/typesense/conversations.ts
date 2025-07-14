import { getTypesenseClient } from '@/lib/typesense/typesense-client';

export interface ConversationMessage {
    role: 'user' | 'assistant';
    content: string;
    timestamp?: number;
}

export interface Conversation {
    id: string;
    title?: string;
    messages: ConversationMessage[];
    collection_name: string;
    model_id?: string;
    created_at?: number;
    updated_at?: number;
    metadata?: {
        total_searches?: number;
        last_search_time?: number;
        search_performance?: {
            avg_response_time?: number;
            total_results_found?: number;
        };
    };
}

export interface CreateConversationRequest {
    title?: string;
    collection_name: string;
    model_id?: string;
    initial_message?: ConversationMessage;
}

export interface UpdateConversationRequest {
    title?: string;
    model_id?: string;
    metadata?: Conversation['metadata'];
}

export interface ConversationSearchRequest {
    conversation_id: string;
    message: string;
    collection: string;
    query_by?: string;
    filter_by?: string;
    sort_by?: string;
    per_page?: number;
    page?: number;
    facet_by?: string;
    max_facet_values?: number;
    model_id?: string;
    include_context?: boolean;
    context_window?: number;
}

export interface ConversationSearchResponse {
    conversation_id: string;
    message_id: string;
    search_results: {
        facet_counts?: any[];
        found: number;
        hits: Array<{
            document: any;
            highlight?: any;
            highlights?: any[];
            text_match?: number;
            text_match_info?: any;
        }>;
        out_of: number;
        page: number;
        request_params: any;
        search_cutoff?: boolean;
        search_time_ms: number;
    };
    llm_response: {
        content: string;
        parsed_query?: {
            query: string;
            filter_by?: string;
            sort_by?: string;
            facet_by?: string;
        };
        raw_response?: string;
        model_used?: string;
        processing_time_ms?: number;
    };
    conversation_context?: ConversationMessage[];
}

// Create a new conversation
export async function createConversation(request: CreateConversationRequest) {
    try {
        const typesenseClient = await getTypesenseClient();

        const response = await (typesenseClient as any).apiCall.post(
            '/conversations',
            request,
        );
        return {
            success: true,
            data: response as Conversation,
        };
    } catch (error) {
        console.error('Error creating conversation:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}

// List all conversations
export async function listConversations(params?: {
    collection_name?: string;
    model_id?: string;
    limit?: number;
    offset?: number;
}) {
    try {
        const typesenseClient = await getTypesenseClient();

        const queryParams = new URLSearchParams();
        if (params?.collection_name)
            queryParams.set('collection_name', params.collection_name);
        if (params?.model_id) queryParams.set('model_id', params.model_id);
        if (params?.limit) queryParams.set('limit', params.limit.toString());
        if (params?.offset) queryParams.set('offset', params.offset.toString());

        const url = queryParams.toString()
            ? `/conversations?${queryParams.toString()}`
            : '/conversations';
        const response = await (typesenseClient as any).apiCall.get(url);

        return {
            success: true,
            data: response.conversations || [],
            total: response.total || 0,
        };
    } catch (error) {
        console.error('Error listing conversations:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            data: [],
            total: 0,
        };
    }
}

// Get a specific conversation
export async function getConversation(conversationId: string) {
    try {
        const typesenseClient = await getTypesenseClient();

        const response = await (typesenseClient as any).apiCall.get(
            `/conversations/${conversationId}`,
        );
        return {
            success: true,
            data: response as Conversation,
        };
    } catch (error) {
        console.error('Error getting conversation:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}

// Update a conversation
export async function updateConversation(
    conversationId: string,
    updates: UpdateConversationRequest,
) {
    try {
        const typesenseClient = await getTypesenseClient();

        const response = await (typesenseClient as any).apiCall.put(
            `/conversations/${conversationId}`,
            updates,
        );
        return {
            success: true,
            data: response as Conversation,
        };
    } catch (error) {
        console.error('Error updating conversation:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}

// Delete a conversation
export async function deleteConversation(conversationId: string) {
    try {
        const typesenseClient = await getTypesenseClient();

        await (typesenseClient as any).apiCall.delete(
            `/conversations/${conversationId}`,
        );
        return {
            success: true,
        };
    } catch (error) {
        console.error('Error deleting conversation:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}

// Perform a conversational search (adds context from previous messages)
export async function conversationSearch(
    request: ConversationSearchRequest,
): Promise<{
    success: boolean;
    data?: ConversationSearchResponse;
    error?: string;
}> {
    try {
        const typesenseClient = await getTypesenseClient();

        const response = await (typesenseClient as any).apiCall.post(
            `/conversations/${request.conversation_id}/search`,
            {
                message: request.message,
                collection: request.collection,
                query_by: request.query_by || '*',
                filter_by: request.filter_by,
                sort_by: request.sort_by,
                per_page: request.per_page || 10,
                page: request.page || 1,
                facet_by: request.facet_by,
                max_facet_values: request.max_facet_values,
                model_id: request.model_id,
                include_context: request.include_context !== false, // Default to true
                context_window: request.context_window || 5, // Last 5 messages by default
            },
        );

        return {
            success: true,
            data: response as ConversationSearchResponse,
        };
    } catch (error) {
        console.error('Error performing conversation search:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}

// Add a message to a conversation (for manual tracking)
export async function addMessageToConversation(
    conversationId: string,
    message: ConversationMessage,
) {
    try {
        const typesenseClient = await getTypesenseClient();

        const response = await (typesenseClient as any).apiCall.post(
            `/conversations/${conversationId}/messages`,
            message,
        );
        return {
            success: true,
            data: response,
        };
    } catch (error) {
        console.error('Error adding message to conversation:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}

// Get conversation history/messages
export async function getConversationMessages(
    conversationId: string,
    params?: {
        limit?: number;
        offset?: number;
        since?: number; // timestamp
    },
) {
    try {
        const typesenseClient = await getTypesenseClient();

        const queryParams = new URLSearchParams();
        if (params?.limit) queryParams.set('limit', params.limit.toString());
        if (params?.offset) queryParams.set('offset', params.offset.toString());
        if (params?.since) queryParams.set('since', params.since.toString());

        const url = queryParams.toString()
            ? `/conversations/${conversationId}/messages?${queryParams.toString()}`
            : `/conversations/${conversationId}/messages`;

        const response = await (typesenseClient as any).apiCall.get(url);

        return {
            success: true,
            data: response.messages || [],
            total: response.total || 0,
        };
    } catch (error) {
        console.error('Error getting conversation messages:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            data: [],
            total: 0,
        };
    }
}

// Clear conversation history (keep conversation but remove messages)
export async function clearConversationHistory(conversationId: string) {
    try {
        const typesenseClient = await getTypesenseClient();

        await (typesenseClient as any).apiCall.delete(
            `/conversations/${conversationId}/messages`,
        );
        return {
            success: true,
        };
    } catch (error) {
        console.error('Error clearing conversation history:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}

// Export conversation to various formats
export async function exportConversation(
    conversationId: string,
    format: 'json' | 'csv' | 'txt' = 'json',
) {
    try {
        const typesenseClient = await getTypesenseClient();

        const response = await (typesenseClient as any).apiCall.get(
            `/conversations/${conversationId}/export?format=${format}`,
        );
        return {
            success: true,
            data: response,
        };
    } catch (error) {
        console.error('Error exporting conversation:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}
