/**
 * Comprehensive tests for all Typesense lib functions.
 * Uses mocked Typesense client to test logic without a running server.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// ─── Mock: typesense-client ──────────────────────────────────────────────────
// Build a chainable mock that mirrors the Typesense JS client surface.
// Avoid recursive creation to prevent infinite loops / OOM.

function createLeafChain(): any {
    return {
        retrieve: vi.fn().mockResolvedValue({}),
        create: vi.fn().mockResolvedValue({}),
        update: vi.fn().mockResolvedValue({}),
        delete: vi.fn().mockResolvedValue({}),
        upsert: vi.fn().mockResolvedValue({}),
        search: vi.fn().mockResolvedValue({}),
        export: vi.fn().mockResolvedValue(''),
        import: vi.fn().mockResolvedValue([]),
    };
}

function createMockClient(): any {
    // Create stable sub-chain instances that are reused across calls.
    // This ensures that when test code sets up mocks like
    // mockClient.aliases().upsert = fn, the same instance is returned
    // when the lib code calls mockClient.aliases().upsert(...)

    const defaultColLeaf = createLeafChain();
    defaultColLeaf.documents = vi.fn().mockReturnValue(createLeafChain());
    defaultColLeaf.overrides = vi.fn().mockReturnValue(createLeafChain());
    defaultColLeaf.synonyms = vi.fn().mockReturnValue(createLeafChain());
    defaultColLeaf.stopwords = vi.fn().mockReturnValue(createLeafChain());

    const defaultKeysLeaf = createLeafChain();

    const defaultAliasesLeaf = createLeafChain();
    defaultAliasesLeaf.upsert = vi.fn().mockResolvedValue({});

    const defaultRulesLeaf = createLeafChain();
    defaultRulesLeaf.upsert = vi.fn().mockResolvedValue({});

    const client: any = {
        // collections() without arg returns the default chain.
        // collections('name') also returns it by default.
        // Tests can override via mockClient.collections.mockReturnValue(...)
        collections: vi.fn().mockReturnValue(defaultColLeaf),
        keys: vi.fn().mockReturnValue(defaultKeysLeaf),
        aliases: vi.fn().mockReturnValue(defaultAliasesLeaf),
        analytics: {
            rules: vi.fn().mockReturnValue(defaultRulesLeaf),
        },
        multiSearch: {
            perform: vi.fn().mockResolvedValue({ results: [] }),
        },
        apiCall: {
            get: vi.fn().mockResolvedValue({}),
            post: vi.fn().mockResolvedValue({}),
            put: vi.fn().mockResolvedValue({}),
            delete: vi.fn().mockResolvedValue({}),
        },
    };
    return client;
}

let mockClient: any;

vi.mock('@/lib/typesense/typesense-client', () => {
    return {
        getTypesenseClient: () => mockClient,
        createTypesenseClient: () => mockClient,
        resetTypesenseClient: vi.fn(),
    };
});

// Mock the server client (used by connection-check.ts)
vi.mock('@/lib/typesense/get-server-client', () => {
    return {
        getServerTypesenseClient: async () => mockClient,
        getServerConnectionConfig: async () => ({
            host: 'localhost',
            port: 8108,
            protocol: 'http',
            apiKey: 'test-key',
        }),
    };
});

// Mock next/headers for get-server-client
vi.mock('next/headers', () => ({
    cookies: async () => ({ get: () => undefined }),
}));

// ─── Tests ───────────────────────────────────────────────────────────────────

beforeEach(() => {
    mockClient = createMockClient();
});

afterEach(() => {
    vi.restoreAllMocks();
});

// ═══════════════════════════════════════════════════════════════════════════════
// 1. ALIASES
// ═══════════════════════════════════════════════════════════════════════════════
describe('Aliases', () => {
    let listAliases: any,
        getAlias: any,
        createAlias: any,
        updateAlias: any,
        deleteAlias: any;

    beforeEach(async () => {
        const mod = await import('@/lib/typesense/aliases');
        listAliases = mod.listAliases;
        getAlias = mod.getAlias;
        createAlias = mod.createAlias;
        updateAlias = mod.updateAlias;
        deleteAlias = mod.deleteAlias;
    });

    it('listAliases returns aliases array', async () => {
        const mockAliases = [
            { name: 'test-alias', collection_name: 'test-col' },
        ];
        mockClient
            .aliases()
            .retrieve.mockResolvedValue({ aliases: mockAliases });
        const result = await listAliases();
        expect(result).toEqual(mockAliases);
    });

    it('listAliases returns null on error', async () => {
        mockClient.aliases().retrieve.mockRejectedValue(new Error('fail'));
        const result = await listAliases();
        expect(result).toBeNull();
    });

    it('getAlias retrieves specific alias', async () => {
        const aliasData = { name: 'my-alias', collection_name: 'my-col' };
        // getAlias('name') calls typesenseClient.aliases('name').retrieve()
        // Since our mock returns the same chain for any arg, just set retrieve on it
        mockClient.aliases().retrieve.mockResolvedValue(aliasData);
        const result = await getAlias('my-alias');
        expect(result).toEqual(aliasData);
    });

    it('createAlias calls upsert with correct params', async () => {
        mockClient
            .aliases()
            .upsert.mockResolvedValue({ name: 'a', collection_name: 'c' });
        const result = await createAlias('a', 'c');
        expect(mockClient.aliases().upsert).toHaveBeenCalledWith('a', {
            collection_name: 'c',
        });
        expect(result).toEqual({ name: 'a', collection_name: 'c' });
    });

    it('updateAlias calls upsert with correct params', async () => {
        mockClient
            .aliases()
            .upsert.mockResolvedValue({ name: 'a', collection_name: 'new-c' });
        const result = await updateAlias('a', 'new-c');
        expect(result).toEqual({ name: 'a', collection_name: 'new-c' });
    });

    it('deleteAlias deletes and returns result', async () => {
        mockClient.aliases().delete.mockResolvedValue({ name: 'a' });
        const result = await deleteAlias('a');
        expect(result).toEqual({ name: 'a' });
    });

    it('deleteAlias returns null on error', async () => {
        mockClient.aliases().delete.mockRejectedValue(new Error('fail'));
        const result = await deleteAlias('a');
        expect(result).toBeNull();
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 2. API KEYS
// ═══════════════════════════════════════════════════════════════════════════════
describe('API Keys', () => {
    let createApiKey: any,
        retrieveApiKeyById: any,
        listApiKeys: any,
        deleteApiKey: any;

    beforeEach(async () => {
        const mod = await import('@/lib/typesense/api-keys');
        createApiKey = mod.createApiKey;
        retrieveApiKeyById = mod.retrieveApiKeyById;
        listApiKeys = mod.listApiKeys;
        deleteApiKey = mod.deleteApiKey;
    });

    it('createApiKey passes correct params', async () => {
        const createFn = vi
            .fn()
            .mockResolvedValue({ id: 1, description: 'test' });
        mockClient.keys().create = createFn;
        const result = await createApiKey('test', ['*'], ['*']);
        expect(createFn).toHaveBeenCalledWith({
            description: 'test',
            actions: ['*'],
            collections: ['*'],
        });
        expect(result).toEqual({ id: 1, description: 'test' });
    });

    it('createApiKey throws on error', async () => {
        mockClient.keys().create.mockRejectedValue(new Error('unauthorized'));
        await expect(createApiKey('x', [], [])).rejects.toThrow('unauthorized');
    });

    it('retrieveApiKeyById fetches key by id', async () => {
        const retrieveFn = vi
            .fn()
            .mockResolvedValue({ id: 5, description: 'key5' });
        mockClient.keys.mockReturnValue({ retrieve: retrieveFn });
        const result = await retrieveApiKeyById(5);
        expect(result).toEqual({ id: 5, description: 'key5' });
    });

    it('listApiKeys returns all keys', async () => {
        const keysList = { keys: [{ id: 1 }, { id: 2 }] };
        mockClient.keys().retrieve.mockResolvedValue(keysList);
        const result = await listApiKeys();
        expect(result).toEqual(keysList);
    });

    it('deleteApiKey deletes by id', async () => {
        const deleteFn = vi.fn().mockResolvedValue({ id: 3 });
        mockClient.keys.mockReturnValue({ delete: deleteFn });
        const result = await deleteApiKey(3);
        expect(result).toEqual({ id: 3 });
    });

    it('deleteApiKey throws on error', async () => {
        mockClient.keys.mockReturnValue({
            delete: vi.fn().mockRejectedValue(new Error('not found')),
        });
        await expect(deleteApiKey(999)).rejects.toThrow('not found');
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 3. ANALYTICS RULES
// ═══════════════════════════════════════════════════════════════════════════════
describe('Analytics Rules', () => {
    let listAnalyticsRules: any,
        createAnalyticsRule: any,
        getAnalyticsRule: any,
        updateAnalyticsRule: any,
        deleteAnalyticsRule: any;

    beforeEach(async () => {
        const mod = await import('@/lib/typesense/analytics-rules');
        listAnalyticsRules = mod.listAnalyticsRules;
        createAnalyticsRule = mod.createAnalyticsRule;
        getAnalyticsRule = mod.getAnalyticsRule;
        updateAnalyticsRule = mod.updateAnalyticsRule;
        deleteAnalyticsRule = mod.deleteAnalyticsRule;
    });

    it('listAnalyticsRules returns rules array', async () => {
        const rules = [{ name: 'rule1' }];
        const innerChain = createLeafChain();
        innerChain.retrieve.mockResolvedValue({ rules });
        mockClient.analytics = { rules: vi.fn().mockReturnValue(innerChain) };
        const result = await listAnalyticsRules();
        expect(result).toEqual(rules);
    });

    it('listAnalyticsRules returns null on error', async () => {
        const innerChain = createLeafChain();
        innerChain.retrieve.mockRejectedValue(new Error('fail'));
        mockClient.analytics = { rules: vi.fn().mockReturnValue(innerChain) };
        const result = await listAnalyticsRules();
        expect(result).toBeNull();
    });

    it('createAnalyticsRule calls upsert', async () => {
        const upsertFn = vi.fn().mockResolvedValue({ name: 'r1' });
        mockClient.analytics = {
            rules: vi.fn().mockReturnValue({ upsert: upsertFn }),
        };
        const result = await createAnalyticsRule('r1', {
            type: 'popular_queries',
        });
        expect(upsertFn).toHaveBeenCalledWith('r1', {
            type: 'popular_queries',
        });
        expect(result).toEqual({ name: 'r1' });
    });

    it('getAnalyticsRule retrieves specific rule', async () => {
        const retrieveFn = vi
            .fn()
            .mockResolvedValue({ name: 'r1', type: 'popular_queries' });
        mockClient.analytics = {
            rules: vi.fn().mockReturnValue({ retrieve: retrieveFn }),
        };
        const result = await getAnalyticsRule('r1');
        expect(result).toEqual({ name: 'r1', type: 'popular_queries' });
    });

    it('getAnalyticsRule returns null on error', async () => {
        const retrieveFn = vi.fn().mockRejectedValue(new Error('not found'));
        mockClient.analytics = {
            rules: vi.fn().mockReturnValue({ retrieve: retrieveFn }),
        };
        const result = await getAnalyticsRule('nonexistent');
        expect(result).toBeNull();
    });

    it('updateAnalyticsRule calls upsert', async () => {
        const upsertFn = vi.fn().mockResolvedValue({ name: 'r1' });
        mockClient.analytics = {
            rules: vi.fn().mockReturnValue({ upsert: upsertFn }),
        };
        const result = await updateAnalyticsRule('r1', {
            type: 'nohits_queries',
        });
        expect(upsertFn).toHaveBeenCalledWith('r1', { type: 'nohits_queries' });
    });

    it('deleteAnalyticsRule deletes rule', async () => {
        const deleteFn = vi.fn().mockResolvedValue({ name: 'r1' });
        mockClient.analytics = {
            rules: vi.fn().mockReturnValue({ delete: deleteFn }),
        };
        const result = await deleteAnalyticsRule('r1');
        expect(result).toEqual({ name: 'r1' });
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 4. STOPWORDS
// ═══════════════════════════════════════════════════════════════════════════════
describe('Stopwords', () => {
    let listStopwords: any, upsertStopwords: any, deleteStopwords: any;

    beforeEach(async () => {
        const mod = await import('@/lib/typesense/stopwords');
        listStopwords = mod.listStopwords;
        upsertStopwords = mod.upsertStopwords;
        deleteStopwords = mod.deleteStopwords;
    });

    it('listStopwords returns stopwords for a collection', async () => {
        const mockStopwords = ['the', 'a', 'an'];
        const stopwordsChain = {
            retrieve: vi.fn().mockResolvedValue({ stopwords: mockStopwords }),
        };
        const collectionChain = {
            stopwords: vi.fn().mockReturnValue(stopwordsChain),
        };
        mockClient.collections.mockReturnValue(collectionChain);
        const result = await listStopwords('test-col');
        expect(result).toEqual(mockStopwords);
    });

    it('listStopwords returns null on error', async () => {
        const stopwordsChain = {
            retrieve: vi.fn().mockRejectedValue(new Error('fail')),
        };
        const collectionChain = {
            stopwords: vi.fn().mockReturnValue(stopwordsChain),
        };
        mockClient.collections.mockReturnValue(collectionChain);
        const result = await listStopwords('test-col');
        expect(result).toBeNull();
    });

    it('upsertStopwords creates/updates stopwords', async () => {
        const upsertFn = vi.fn().mockResolvedValue({ id: 'sw1' });
        const stopwordsChain = { upsert: upsertFn };
        const collectionChain = {
            stopwords: vi.fn().mockReturnValue(stopwordsChain),
        };
        mockClient.collections.mockReturnValue(collectionChain);
        const result = await upsertStopwords('col', 'sw1', {
            stopwords: ['the'],
        });
        expect(upsertFn).toHaveBeenCalledWith('sw1', { stopwords: ['the'] });
    });

    it('deleteStopwords deletes a stopwords set', async () => {
        const deleteFn = vi.fn().mockResolvedValue({ id: 'sw1' });
        const stopwordsChain = { delete: deleteFn };
        mockClient.collections.mockReturnValue({
            stopwords: vi.fn().mockReturnValue(stopwordsChain),
        });
        const result = await deleteStopwords('col', 'sw1');
        expect(result).toEqual({ id: 'sw1' });
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 5. SYNONYMS
// ═══════════════════════════════════════════════════════════════════════════════
describe('Synonyms', () => {
    let createSynonym: any,
        updateSynonym: any,
        getSynonym: any,
        listSynonyms: any,
        deleteSynonym: any,
        validateSynonymData: any;

    beforeEach(async () => {
        const mod = await import('@/lib/typesense/synonyms');
        createSynonym = mod.createSynonym;
        updateSynonym = mod.updateSynonym;
        getSynonym = mod.getSynonym;
        listSynonyms = mod.listSynonyms;
        deleteSynonym = mod.deleteSynonym;
        validateSynonymData = mod.validateSynonymData;
    });

    it('createSynonym returns success', async () => {
        const upsertFn = vi
            .fn()
            .mockResolvedValue({ id: 's1', synonyms: ['fast', 'quick'] });
        const synonymsChain = { upsert: upsertFn };
        const colChain = { synonyms: vi.fn().mockReturnValue(synonymsChain) };
        mockClient.collections.mockReturnValue(colChain);
        const result = await createSynonym('col', 's1', {
            synonyms: ['fast', 'quick'],
        });
        expect(result.success).toBe(true);
        expect(result.data).toEqual({ id: 's1', synonyms: ['fast', 'quick'] });
    });

    it('createSynonym returns error on failure', async () => {
        const upsertFn = vi.fn().mockRejectedValue(new Error('bad request'));
        const synonymsChain = { upsert: upsertFn };
        const colChain = { synonyms: vi.fn().mockReturnValue(synonymsChain) };
        mockClient.collections.mockReturnValue(colChain);
        const result = await createSynonym('col', 's1', { synonyms: ['a'] });
        expect(result.success).toBe(false);
        expect(result.error).toBe('bad request');
    });

    it('listSynonyms retrieves all synonyms for collection', async () => {
        const retrieveFn = vi
            .fn()
            .mockResolvedValue({ synonyms: [{ id: 's1' }] });
        const synonymsChain = { retrieve: retrieveFn };
        const colChain = { synonyms: vi.fn().mockReturnValue(synonymsChain) };
        mockClient.collections.mockReturnValue(colChain);
        const result = await listSynonyms('col');
        expect(result.success).toBe(true);
        expect(result.data).toEqual([{ id: 's1' }]);
    });

    it('deleteSynonym returns success', async () => {
        const deleteFn = vi.fn().mockResolvedValue({});
        const synonymsChain = { delete: deleteFn };
        mockClient.collections.mockReturnValue({
            synonyms: vi.fn().mockReturnValue(synonymsChain),
        });
        const result = await deleteSynonym('col', 's1');
        expect(result.success).toBe(true);
    });

    // Validate synonym data (pure function)
    it('validateSynonymData - valid data', () => {
        const result = validateSynonymData({ synonyms: ['fast', 'quick'] });
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
    });

    it('validateSynonymData - empty synonyms array', () => {
        const result = validateSynonymData({ synonyms: [] });
        expect(result.valid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
    });

    it('validateSynonymData - missing synonyms', () => {
        const result = validateSynonymData({} as any);
        expect(result.valid).toBe(false);
    });

    it('validateSynonymData - empty string synonym', () => {
        const result = validateSynonymData({ synonyms: ['fast', '  '] });
        expect(result.valid).toBe(false);
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 6. SEARCH OVERRIDES (CURATIONS)
// ═══════════════════════════════════════════════════════════════════════════════
describe('Search Overrides', () => {
    let listSearchOverrides: any,
        getSearchOverride: any,
        createSearchOverride: any,
        updateSearchOverride: any,
        deleteSearchOverride: any,
        validateOverrideData: any;

    beforeEach(async () => {
        const mod = await import('@/lib/typesense/search-overrides');
        listSearchOverrides = mod.listSearchOverrides;
        getSearchOverride = mod.getSearchOverride;
        createSearchOverride = mod.createSearchOverride;
        updateSearchOverride = mod.updateSearchOverride;
        deleteSearchOverride = mod.deleteSearchOverride;
        validateOverrideData = mod.validateOverrideData;
    });

    it('listSearchOverrides aggregates overrides across collections', async () => {
        // Mock collections().retrieve() to return 2 collections
        mockClient
            .collections()
            .retrieve.mockResolvedValue([{ name: 'col1' }, { name: 'col2' }]);
        // Mock per-collection overrides
        const overridesChain1 = {
            retrieve: vi.fn().mockResolvedValue({ overrides: [{ id: 'o1' }] }),
        };
        const overridesChain2 = {
            retrieve: vi.fn().mockResolvedValue({ overrides: [{ id: 'o2' }] }),
        };
        let callCount = 0;
        mockClient.collections.mockImplementation((name?: string) => {
            if (!name)
                return {
                    retrieve: vi
                        .fn()
                        .mockResolvedValue([
                            { name: 'col1' },
                            { name: 'col2' },
                        ]),
                };
            if (name === 'col1') return { overrides: () => overridesChain1 };
            if (name === 'col2') return { overrides: () => overridesChain2 };
        });
        const result = await listSearchOverrides();
        expect(result).toHaveLength(2);
        expect(result![0].collection_name).toBe('col1');
        expect(result![1].collection_name).toBe('col2');
    });

    it('listSearchOverrides returns null on top-level error', async () => {
        mockClient.collections.mockImplementation(() => {
            throw new Error('connection failed');
        });
        const result = await listSearchOverrides();
        expect(result).toBeNull();
    });

    it('getSearchOverride returns override data', async () => {
        const overrideData = { id: 'o1', rule: { query: 'test' } };
        const overridesChain = {
            retrieve: vi.fn().mockResolvedValue(overrideData),
        };
        mockClient.collections.mockReturnValue({
            overrides: vi.fn().mockReturnValue(overridesChain),
        });
        const result = await getSearchOverride('col', 'o1');
        expect(result).toEqual(overrideData);
    });

    it('createSearchOverride calls upsert', async () => {
        const upsertFn = vi.fn().mockResolvedValue({ id: 'o1' });
        const overridesChain = { upsert: upsertFn };
        mockClient.collections.mockReturnValue({
            overrides: vi.fn().mockReturnValue(overridesChain),
        });
        const result = await createSearchOverride('col', 'o1', {
            rule: { query: 'test' },
        });
        expect(upsertFn).toHaveBeenCalledWith('o1', {
            rule: { query: 'test' },
        });
    });

    it('deleteSearchOverride deletes override', async () => {
        const deleteFn = vi.fn().mockResolvedValue({ id: 'o1' });
        mockClient.collections.mockReturnValue({
            overrides: vi.fn().mockReturnValue({ delete: deleteFn }),
        });
        const result = await deleteSearchOverride('col', 'o1');
        expect(result).toEqual({ id: 'o1' });
    });

    // validateOverrideData (pure function)
    it('validateOverrideData - valid data', () => {
        const result = validateOverrideData({
            rule: { query: 'test' },
            applies_to: 'always',
        });
        expect(result.valid).toBe(true);
    });

    it('validateOverrideData - missing query', () => {
        const result = validateOverrideData({ rule: {} });
        expect(result.valid).toBe(false);
    });

    it('validateOverrideData - invalid applies_to', () => {
        const result = validateOverrideData({
            rule: { query: 'test' },
            applies_to: 'invalid',
        });
        expect(result.valid).toBe(false);
    });

    it('validateOverrideData - force_include not array', () => {
        const result = validateOverrideData({
            rule: { query: 'test' },
            force_include: 'not-array',
        });
        expect(result.valid).toBe(false);
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 7. STEMMING
// ═══════════════════════════════════════════════════════════════════════════════
describe('Stemming', () => {
    let listStemmingDictionaries: any,
        getStemmingDictionary: any,
        importStemmingDictionary: any;

    beforeEach(async () => {
        const mod = await import('@/lib/typesense/stemming');
        listStemmingDictionaries = mod.listStemmingDictionaries;
        getStemmingDictionary = mod.getStemmingDictionary;
        importStemmingDictionary = mod.importStemmingDictionary;
    });

    it('listStemmingDictionaries returns array', async () => {
        mockClient.apiCall.get.mockResolvedValue([
            { id: 'en-dict' },
            { id: 'fr-dict' },
        ]);
        const result = await listStemmingDictionaries();
        expect(result.success).toBe(true);
        expect(result.data).toHaveLength(2);
        expect(mockClient.apiCall.get).toHaveBeenCalledWith(
            '/stemming/dictionaries',
        );
    });

    it('listStemmingDictionaries handles dictionaries wrapper', async () => {
        mockClient.apiCall.get.mockResolvedValue({
            dictionaries: [{ id: 'dict1' }],
        });
        const result = await listStemmingDictionaries();
        expect(result.success).toBe(true);
        expect(result.data).toEqual([{ id: 'dict1' }]);
    });

    it('listStemmingDictionaries returns error on failure', async () => {
        mockClient.apiCall.get.mockRejectedValue(new Error('network error'));
        const result = await listStemmingDictionaries();
        expect(result.success).toBe(false);
        expect(result.error).toBe('network error');
        expect(result.data).toEqual([]);
    });

    it('getStemmingDictionary returns specific dictionary', async () => {
        const dictData = {
            id: 'en-dict',
            words: [{ word: 'running', root: 'run' }],
        };
        mockClient.apiCall.get.mockResolvedValue(dictData);
        const result = await getStemmingDictionary('en-dict');
        expect(result.success).toBe(true);
        expect(result.data).toEqual(dictData);
        expect(mockClient.apiCall.get).toHaveBeenCalledWith(
            '/stemming/dictionaries/en-dict',
        );
    });

    it('getStemmingDictionary returns error on failure', async () => {
        mockClient.apiCall.get.mockRejectedValue(new Error('not found'));
        const result = await getStemmingDictionary('nonexistent');
        expect(result.success).toBe(false);
        expect(result.error).toBe('not found');
    });

    it('importStemmingDictionary sends JSONL body', async () => {
        mockClient.apiCall.post.mockResolvedValue({ success: true });
        const words = [
            { word: 'running', root: 'run' },
            { word: 'swimming', root: 'swim' },
        ];
        const result = await importStemmingDictionary('en-dict', words);
        expect(result.success).toBe(true);

        // Verify the JSONL format
        const expectedJsonl =
            '{"word":"running","root":"run"}\n{"word":"swimming","root":"swim"}';
        expect(mockClient.apiCall.post).toHaveBeenCalledWith(
            '/stemming/dictionaries/import?id=en-dict',
            expectedJsonl,
            { contentType: 'text/plain' },
        );
    });

    it('importStemmingDictionary returns error on failure', async () => {
        mockClient.apiCall.post.mockRejectedValue(new Error('bad format'));
        const result = await importStemmingDictionary('d1', [
            { word: 'a', root: 'b' },
        ]);
        expect(result.success).toBe(false);
        expect(result.error).toBe('bad format');
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 8. CLUSTER OPERATIONS
// ═══════════════════════════════════════════════════════════════════════════════
describe('Cluster Operations', () => {
    let createSnapshot: any,
        compactDatabase: any,
        reelectLeader: any,
        toggleSlowRequestLog: any,
        clearCache: any,
        getDebugInfo: any,
        getApiStats: any,
        getHealthStatus: any;

    beforeEach(async () => {
        const mod = await import('@/lib/typesense/cluster-operations');
        createSnapshot = mod.createSnapshot;
        compactDatabase = mod.compactDatabase;
        reelectLeader = mod.reelectLeader;
        toggleSlowRequestLog = mod.toggleSlowRequestLog;
        clearCache = mod.clearCache;
        getDebugInfo = mod.getDebugInfo;
        getApiStats = mod.getApiStats;
        getHealthStatus = mod.getHealthStatus;
    });

    it('createSnapshot posts with snapshot_path', async () => {
        mockClient.apiCall.post.mockResolvedValue({ success: true });
        const result = await createSnapshot('/tmp/snap');
        expect(result.success).toBe(true);
        expect(mockClient.apiCall.post).toHaveBeenCalledWith(
            '/operations/snapshot?snapshot_path=%2Ftmp%2Fsnap',
        );
    });

    it('createSnapshot returns error on failure', async () => {
        mockClient.apiCall.post.mockRejectedValue(new Error('disk full'));
        const result = await createSnapshot('/tmp/snap');
        expect(result.success).toBe(false);
        expect(result.error).toBe('disk full');
    });

    it('compactDatabase posts to correct endpoint', async () => {
        mockClient.apiCall.post.mockResolvedValue({ success: true });
        const result = await compactDatabase();
        expect(result.success).toBe(true);
        expect(mockClient.apiCall.post).toHaveBeenCalledWith(
            '/operations/db/compact',
        );
    });

    it('reelectLeader posts to vote endpoint', async () => {
        mockClient.apiCall.post.mockResolvedValue({ success: true });
        const result = await reelectLeader();
        expect(result.success).toBe(true);
        expect(mockClient.apiCall.post).toHaveBeenCalledWith(
            '/operations/vote',
        );
    });

    it('toggleSlowRequestLog sends config', async () => {
        mockClient.apiCall.post.mockResolvedValue({ success: true });
        const result = await toggleSlowRequestLog(2000);
        expect(result.success).toBe(true);
        expect(mockClient.apiCall.post).toHaveBeenCalledWith('/config', {
            'log-slow-requests-time-ms': 2000,
        });
    });

    it('toggleSlowRequestLog disables with -1', async () => {
        mockClient.apiCall.post.mockResolvedValue({ success: true });
        const result = await toggleSlowRequestLog(-1);
        expect(result.success).toBe(true);
        expect(mockClient.apiCall.post).toHaveBeenCalledWith('/config', {
            'log-slow-requests-time-ms': -1,
        });
    });

    it('clearCache posts to correct endpoint', async () => {
        mockClient.apiCall.post.mockResolvedValue({ success: true });
        const result = await clearCache();
        expect(result.success).toBe(true);
        expect(mockClient.apiCall.post).toHaveBeenCalledWith(
            '/operations/cache/clear',
        );
    });

    it('getDebugInfo fetches debug info', async () => {
        const debugData = { state: 1, version: '0.25.0' };
        mockClient.apiCall.get.mockResolvedValue(debugData);
        const result = await getDebugInfo();
        expect(result.success).toBe(true);
        expect(result.data).toEqual(debugData);
        expect(mockClient.apiCall.get).toHaveBeenCalledWith('/debug');
    });

    it('getApiStats fetches stats', async () => {
        const statsData = { latency_ms: { GET_collections: 5 } };
        mockClient.apiCall.get.mockResolvedValue(statsData);
        const result = await getApiStats();
        expect(result.success).toBe(true);
        expect(mockClient.apiCall.get).toHaveBeenCalledWith('/stats.json');
    });

    it('getHealthStatus fetches health', async () => {
        mockClient.apiCall.get.mockResolvedValue({ ok: true });
        const result = await getHealthStatus();
        expect(result.success).toBe(true);
        expect(result.data).toEqual({ ok: true });
        expect(mockClient.apiCall.get).toHaveBeenCalledWith('/health');
    });

    it('getHealthStatus returns error on failure', async () => {
        mockClient.apiCall.get.mockRejectedValue(new Error('timeout'));
        const result = await getHealthStatus();
        expect(result.success).toBe(false);
        expect(result.error).toBe('timeout');
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 9. COLLECTIONS (server-side)
// ═══════════════════════════════════════════════════════════════════════════════
describe('Collections', () => {
    let getCollections: any,
        getCollection: any,
        createCollection: any,
        deleteCollection: any;

    beforeEach(async () => {
        const mod = await import('@/lib/typesense/collections');
        getCollections = mod.getCollections;
        getCollection = mod.getCollection;
        createCollection = mod.createCollection;
        deleteCollection = mod.deleteCollection;
    });

    it('getCollections returns success with data', async () => {
        const collections = [{ name: 'col1' }, { name: 'col2' }];
        mockClient.collections().retrieve.mockResolvedValue(collections);
        const result = await getCollections();
        expect(result.success).toBe(true);
        expect(result.data).toEqual(collections);
    });

    it('getCollections returns error on failure', async () => {
        mockClient.collections().retrieve.mockRejectedValue(new Error('fail'));
        const result = await getCollections();
        expect(result.success).toBe(false);
        expect(result.error).toBe('fail');
    });

    it('getCollection retrieves specific collection', async () => {
        const colData = { name: 'test', num_documents: 100, fields: [] };
        mockClient.collections.mockReturnValue({
            retrieve: vi.fn().mockResolvedValue(colData),
        });
        const result = await getCollection('test');
        expect(result.success).toBe(true);
        expect(result.data).toEqual(colData);
    });

    it('getCollection returns error when not found', async () => {
        mockClient.collections.mockReturnValue({
            retrieve: vi.fn().mockResolvedValue(null),
        });
        const result = await getCollection('nonexistent');
        expect(result.success).toBe(false);
        expect(result.error).toBe('Collection not found');
    });

    it('createCollection creates new collection', async () => {
        const schema = {
            name: 'new-col',
            fields: [{ name: 'title', type: 'string' }],
        };
        const colChain = createLeafChain();
        colChain.create.mockResolvedValue({ name: 'new-col' });
        mockClient.collections.mockReturnValue(colChain);
        const result = await createCollection(schema as any);
        expect(result).toEqual({ name: 'new-col' });
    });

    it('createCollection returns null on error', async () => {
        const colChain = createLeafChain();
        colChain.create.mockRejectedValue(new Error('already exists'));
        mockClient.collections.mockReturnValue(colChain);
        const result = await createCollection({ name: 'x', fields: [] } as any);
        expect(result).toBeNull();
    });

    it('deleteCollection deletes and returns result', async () => {
        mockClient.collections.mockReturnValue({
            delete: vi.fn().mockResolvedValue({ name: 'col1' }),
        });
        const result = await deleteCollection('col1');
        expect(result).toEqual({ name: 'col1' });
    });

    it('deleteCollection returns null on error', async () => {
        mockClient.collections.mockReturnValue({
            delete: vi.fn().mockRejectedValue(new Error('fail')),
        });
        const result = await deleteCollection('col1');
        expect(result).toBeNull();
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 10. DOCUMENTS
// ═══════════════════════════════════════════════════════════════════════════════
describe('Documents', () => {
    let createDocument: any,
        getDocumentById: any,
        updateDocument: any,
        deleteDocument: any,
        searchDocuments: any,
        multiSearch: any;

    beforeEach(async () => {
        const mod = await import('@/lib/typesense/documents');
        createDocument = mod.createDocument;
        getDocumentById = mod.getDocumentById;
        updateDocument = mod.updateDocument;
        deleteDocument = mod.deleteDocument;
        searchDocuments = mod.searchDocuments;
        multiSearch = mod.multiSearch;
    });

    it('createDocument creates a document', async () => {
        const doc = { id: '1', title: 'Test' };
        const createFn = vi.fn().mockResolvedValue(doc);
        const documentsChain = createLeafChain();
        documentsChain.create = createFn;
        mockClient.collections.mockReturnValue({
            documents: () => documentsChain,
        });
        const result = await createDocument('col', doc);
        // createDocument returns raw data or null
        expect(result).toEqual(doc);
    });

    it('createDocument returns null on failure', async () => {
        const createFn = vi
            .fn()
            .mockRejectedValue(new Error('validation fail'));
        const documentsChain = createLeafChain();
        documentsChain.create = createFn;
        mockClient.collections.mockReturnValue({
            documents: () => documentsChain,
        });
        const result = await createDocument('col', {});
        expect(result).toBeNull();
    });

    it('getDocumentById retrieves document', async () => {
        const doc = { id: '1', title: 'Test' };
        const retrieveFn = vi.fn().mockResolvedValue(doc);
        // documents(id) returns a chain with retrieve
        mockClient.collections.mockReturnValue({
            documents: vi.fn().mockReturnValue({ retrieve: retrieveFn }),
        });
        const result = await getDocumentById('col', '1');
        // getDocumentById returns raw data or null
        expect(result).toEqual(doc);
    });

    it('updateDocument updates a document', async () => {
        const updated = { id: '1', title: 'Updated' };
        const updateFn = vi.fn().mockResolvedValue(updated);
        mockClient.collections.mockReturnValue({
            documents: vi.fn().mockReturnValue({ update: updateFn }),
        });
        const result = await updateDocument('col', '1', { title: 'Updated' });
        expect(result).toEqual(updated);
    });

    it('deleteDocument deletes a document', async () => {
        const deleteFn = vi.fn().mockResolvedValue({ id: '1' });
        mockClient.collections.mockReturnValue({
            documents: vi.fn().mockReturnValue({ delete: deleteFn }),
        });
        const result = await deleteDocument('col', '1');
        expect(result).toEqual({ id: '1' });
    });

    it('searchDocuments performs search', async () => {
        const searchResult = { found: 5, hits: [{ document: { id: '1' } }] };
        const searchFn = vi.fn().mockResolvedValue(searchResult);
        const documentsChain = createLeafChain();
        documentsChain.search = searchFn;
        mockClient.collections.mockReturnValue({
            documents: () => documentsChain,
        });
        // searchDocuments(collectionName, query, queryBy, ...)
        const result = await searchDocuments('col', 'test', 'title');
        expect(result).toEqual(searchResult);
        expect(result.found).toBe(5);
    });

    it('multiSearch performs multi-collection search', async () => {
        const searchResult = { results: [{ found: 3, hits: [] }] };
        mockClient.multiSearch = {
            perform: vi.fn().mockResolvedValue(searchResult),
        };
        const result = await multiSearch({
            searchQueries: [{ collection: 'col', q: 'test', queryBy: 'title' }],
        });
        // multiSearch returns the response directly or null
        expect(result).toBeDefined();
        expect(result!.results).toHaveLength(1);
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 11. NL SEARCH MODELS
// ═══════════════════════════════════════════════════════════════════════════════
describe('NL Search Models', () => {
    let createNLSearchModel: any,
        listNLSearchModels: any,
        getNLSearchModel: any,
        updateNLSearchModel: any,
        deleteNLSearchModel: any;

    beforeEach(async () => {
        const mod = await import('@/lib/typesense/nl-search-models');
        createNLSearchModel = mod.createNLSearchModel;
        listNLSearchModels = mod.listNLSearchModels;
        getNLSearchModel = mod.getNLSearchModel;
        updateNLSearchModel = mod.updateNLSearchModel;
        deleteNLSearchModel = mod.deleteNLSearchModel;
    });

    it('createNLSearchModel posts to correct endpoint', async () => {
        mockClient.apiCall.post.mockResolvedValue({ id: 'm1' });
        const model = {
            name: 'test-model',
            model_type: 'openai',
            model_config: { model_name: 'gpt-4' },
            collections: [],
        };
        const result = await createNLSearchModel(model);
        expect(result.success).toBe(true);
        expect(mockClient.apiCall.post).toHaveBeenCalledWith(
            '/nl_search_models',
            model,
        );
    });

    it('listNLSearchModels returns array', async () => {
        mockClient.apiCall.get.mockResolvedValue([{ id: 'm1' }, { id: 'm2' }]);
        const result = await listNLSearchModels();
        expect(result.success).toBe(true);
        expect(result.data).toHaveLength(2);
    });

    it('listNLSearchModels handles wrapped response', async () => {
        mockClient.apiCall.get.mockResolvedValue({ models: [{ id: 'm1' }] });
        const result = await listNLSearchModels();
        expect(result.success).toBe(true);
        expect(result.data).toEqual([{ id: 'm1' }]);
    });

    it('getNLSearchModel fetches specific model', async () => {
        mockClient.apiCall.get.mockResolvedValue({
            id: 'm1',
            model_name: 'gpt-4',
        });
        const result = await getNLSearchModel('m1');
        expect(result.success).toBe(true);
        expect(mockClient.apiCall.get).toHaveBeenCalledWith(
            '/nl_search_models/m1',
        );
    });

    it('updateNLSearchModel updates model', async () => {
        mockClient.apiCall.put.mockResolvedValue({ id: 'm1' });
        const result = await updateNLSearchModel('m1', { name: 'updated' });
        expect(result.success).toBe(true);
        expect(mockClient.apiCall.put).toHaveBeenCalledWith(
            '/nl_search_models/m1',
            { name: 'updated' },
        );
    });

    it('deleteNLSearchModel deletes model', async () => {
        mockClient.apiCall.delete.mockResolvedValue({ id: 'm1' });
        const result = await deleteNLSearchModel('m1');
        expect(result.success).toBe(true);
    });

    it('listNLSearchModels returns error on failure', async () => {
        mockClient.apiCall.get.mockRejectedValue(new Error('timeout'));
        const result = await listNLSearchModels();
        expect(result.success).toBe(false);
        expect(result.error).toBe('timeout');
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 12. CONVERSATIONS
// ═══════════════════════════════════════════════════════════════════════════════
describe('Conversations', () => {
    let createConversation: any, listConversations: any, getConversation: any;

    beforeEach(async () => {
        const mod = await import('@/lib/typesense/conversations');
        createConversation = mod.createConversation;
        listConversations = mod.listConversations;
        getConversation = mod.getConversation;
    });

    it('createConversation posts to correct endpoint', async () => {
        mockClient.apiCall.post.mockResolvedValue({
            id: 'conv1',
            messages: [],
        });
        const result = await createConversation({
            collection_name: 'col',
            title: 'Test',
        });
        expect(result.success).toBe(true);
        expect(mockClient.apiCall.post).toHaveBeenCalledWith('/conversations', {
            collection_name: 'col',
            title: 'Test',
        });
    });

    it('listConversations fetches all conversations', async () => {
        mockClient.apiCall.get.mockResolvedValue({
            conversations: [{ id: 'c1' }],
            total: 1,
        });
        const result = await listConversations();
        expect(result.success).toBe(true);
        expect(result.data).toEqual([{ id: 'c1' }]);
    });

    it('listConversations with filters', async () => {
        mockClient.apiCall.get.mockResolvedValue({
            conversations: [],
            total: 0,
        });
        await listConversations({ collection_name: 'col', limit: 10 });
        expect(mockClient.apiCall.get).toHaveBeenCalledWith(
            expect.stringContaining('collection_name=col'),
        );
    });

    it('getConversation fetches specific conversation', async () => {
        mockClient.apiCall.get.mockResolvedValue({ id: 'conv1', messages: [] });
        const result = await getConversation('conv1');
        expect(result.success).toBe(true);
        expect(mockClient.apiCall.get).toHaveBeenCalledWith(
            '/conversations/conv1',
        );
    });

    it('listConversations returns error on failure', async () => {
        mockClient.apiCall.get.mockRejectedValue(new Error('unavailable'));
        const result = await listConversations();
        expect(result.success).toBe(false);
        expect(result.error).toBe('unavailable');
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 13. CONNECTION CONFIG
// ═══════════════════════════════════════════════════════════════════════════════
describe('Connection Config', () => {
    let getConnectionConfigFromEnv: any,
        hasEnvConnectionConfig: any,
        getDefaultConnectionConfig: any;

    beforeEach(async () => {
        const mod = await import('@/lib/connection-config');
        getConnectionConfigFromEnv = mod.getConnectionConfigFromEnv;
        hasEnvConnectionConfig = mod.hasEnvConnectionConfig;
        getDefaultConnectionConfig = mod.getDefaultConnectionConfig;
    });

    it('getDefaultConnectionConfig returns localhost defaults', () => {
        const config = getDefaultConnectionConfig();
        expect(config.host).toBe('localhost');
        expect(config.port).toBe(8108);
        expect(config.protocol).toBe('http');
        expect(config.apiKey).toBe('xyz');
    });

    it('getConnectionConfigFromEnv returns null without env vars', () => {
        delete process.env.TYPESENSE_HOST;
        delete process.env.TYPESENSE_PORT;
        delete process.env.TYPESENSE_PROTOCOL;
        delete process.env.TYPESENSE_API_KEY;
        const config = getConnectionConfigFromEnv();
        expect(config).toBeNull();
    });

    it('getConnectionConfigFromEnv reads from env when all set', () => {
        process.env.TYPESENSE_HOST = 'ts.example.com';
        process.env.TYPESENSE_PORT = '443';
        process.env.TYPESENSE_PROTOCOL = 'https';
        process.env.TYPESENSE_API_KEY = 'secret';
        const config = getConnectionConfigFromEnv();
        expect(config).toEqual({
            host: 'ts.example.com',
            port: 443,
            protocol: 'https',
            apiKey: 'secret',
        });
        // Cleanup
        delete process.env.TYPESENSE_HOST;
        delete process.env.TYPESENSE_PORT;
        delete process.env.TYPESENSE_PROTOCOL;
        delete process.env.TYPESENSE_API_KEY;
    });

    it('hasEnvConnectionConfig returns false when env not set', () => {
        delete process.env.TYPESENSE_HOST;
        expect(hasEnvConnectionConfig()).toBe(false);
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 14. TYPESENSE CLIENT
// ═══════════════════════════════════════════════════════════════════════════════
describe('Typesense Client', () => {
    it('createTypesenseClient creates a client with config', async () => {
        // Since we're mocking the module, test that the mock returns our mockClient
        const { getTypesenseClient } =
            await import('@/lib/typesense/typesense-client');
        const client = getTypesenseClient();
        expect(client).toBeDefined();
    });

    it('resetTypesenseClient can be called', async () => {
        const { resetTypesenseClient } =
            await import('@/lib/typesense/typesense-client');
        expect(() => resetTypesenseClient()).not.toThrow();
    });
});
