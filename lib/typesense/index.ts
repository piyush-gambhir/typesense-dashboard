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
    getCollectionStats,
    getCollectionHealth,
    validateCollectionSchema,
    getCollectionConfig,
    updateCollectionConfig,
    getCollectionFields,
    addCollectionFields,
    backupCollection,
    restoreCollection,
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
    bulkCreateDocuments,
    bulkUpdateDocuments,
    bulkUpsertDocuments,
    emplaceDocument,
    getDocumentCount,
    documentExists,
    bulkDeleteDocuments,
    getDocumentFieldStats,
    getDocumentMetadata,
    updateDocumentMetadata,
    getDocumentsByFilter,
    getAllDocuments,
    validateDocument,
    getDocumentSuggestions,
} from './documents';

// API Keys
export {
    createApiKey,
    retrieveApiKeyById,
    listApiKeys,
    deleteApiKey,
} from './api-keys';

// Aliases
export {
    listAliases,
    getAlias,
    createAlias,
    updateAlias,
    deleteAlias,
} from './aliases';

// Analytics Rules
export {
    listAnalyticsRules,
    createAnalyticsRule,
    deleteAnalyticsRule,
} from './analytics-rules';

// Search Overrides
export {
    listSearchOverrides,
    getSearchOverride,
    createSearchOverride,
    updateSearchOverride,
    deleteSearchOverride,
    validateOverrideData,
    type SearchOverride,
} from './search-overrides';

// Stopwords
export { listStopwords, upsertStopwords, deleteStopwords } from './stopwords';

// Synonyms
export {
    createSynonym,
    updateSynonym,
    getSynonym,
    listSynonyms,
    deleteSynonym,
    validateSynonymData,
    type Synonym,
    type SynonymResponse,
    type CreateSynonymRequest,
    type ListSynonymsResponse,
} from './synonyms';

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
export { default as typesenseClient, getTypesenseClient } from './typesense-client';

// Connection utilities
export {
    checkTypesenseConnection,
    isTypesenseAvailable,
} from './connection-check';
export type { ConnectionStatus } from './connection-check';
