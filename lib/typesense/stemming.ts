import { getTypesenseClient } from '@/lib/typesense/typesense-client';

export interface StemmingWord {
    word: string;
    root: string;
}

export interface StemmingDictionary {
    id: string;
    words?: StemmingWord[];
}

// List all stemming dictionaries
export async function listStemmingDictionaries() {
    try {
        const typesenseClient = getTypesenseClient();
        const response = await (typesenseClient as any).apiCall.get(
            '/stemming/dictionaries',
        );
        return {
            success: true,
            data: Array.isArray(response)
                ? response
                : response.dictionaries || [],
        };
    } catch (error) {
        console.error('Error listing stemming dictionaries:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            data: [],
        };
    }
}

// Get a specific stemming dictionary
export async function getStemmingDictionary(dictionaryId: string) {
    try {
        const typesenseClient = getTypesenseClient();
        const response = await (typesenseClient as any).apiCall.get(
            `/stemming/dictionaries/${dictionaryId}`,
        );
        return {
            success: true,
            data: response as StemmingDictionary,
        };
    } catch (error) {
        console.error('Error getting stemming dictionary:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}

// Import a stemming dictionary (create or replace)
// Words should be an array of {word, root} objects
export async function importStemmingDictionary(
    dictionaryId: string,
    words: StemmingWord[],
) {
    try {
        const typesenseClient = getTypesenseClient();
        // The API expects JSONL format
        const jsonlBody = words
            .map((w) => JSON.stringify({ word: w.word, root: w.root }))
            .join('\n');

        const response = await (typesenseClient as any).apiCall.post(
            `/stemming/dictionaries/import?id=${dictionaryId}`,
            jsonlBody,
            { contentType: 'text/plain' },
        );
        return {
            success: true,
            data: response,
        };
    } catch (error) {
        console.error('Error importing stemming dictionary:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}
