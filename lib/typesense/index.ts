// Collections
export {
    getCollections,
    getCollection,
    createCollection,
    updateCollection,
    deleteCollection,
    listDocuments,
    exportCollection,
    importCollection,
    createCollectionWithJsonl,
    type importAction,
} from './collections';

// Documents
export {
    multiSearch,
    createDocument,
    getDocumentById,
    updateDocument,
    deleteDocument,
    deleteDocumentsByQuery,
    upsertDocument,
    searchDocuments,
} from './documents';

// API Keys
export {
    createApiKey,
    retrieveApiKeyById,
    listApiKeys,
    deleteApiKey,
} from './api-keys';

// Aliases
export { listAliases, createAlias, deleteAlias } from './aliases';

// Analytics Rules
export {
    listAnalyticsRules,
    createAnalyticsRule,
    deleteAnalyticsRule,
} from './analytics-rules';

// Search Overrides
export {
    listSearchOverrides,
    createSearchOverride,
    deleteSearchOverride,
} from './search-overrides';

// Stopwords
export { listStopwords, upsertStopwords, deleteStopwords } from './stopwords';

// Natural Language Search
export {
    createNLSearchModel,
    listNLSearchModels,
    getNLSearchModel,
    updateNLSearchModel,
    deleteNLSearchModel,
    naturalLanguageSearch,
    getAvailableModelTypes,
    getDefaultSystemPrompts,
} from './nl-search-models';

// Conversations
export {
    createConversation,
    listConversations,
    getConversation,
    updateConversation,
    deleteConversation,
    conversationSearch,
    addMessageToConversation,
    getConversationMessages,
    clearConversationHistory,
    exportConversation,
    type Conversation,
    type ConversationMessage,
    type CreateConversationRequest,
    type UpdateConversationRequest,
    type ConversationSearchRequest,
    type ConversationSearchResponse,
} from './conversations';

// Cluster Health & Metrics
export { getClusterHealth } from './cluster-health';
export { getTypesenseMetrics } from './get-cluster-metrics';

// Client
export { default as typesenseClient } from './typesense-client';
