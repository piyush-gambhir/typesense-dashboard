import typesenseClient from './typesense-client';

export interface Synonym {
    id: string;
    synonyms: string[];
    root?: string;
    locale?: string;
    symbols_to_index?: string[];
}

export interface SynonymResponse {
    id: string;
    synonyms: string[];
    root?: string;
    locale?: string;
    symbols_to_index?: string[];
}

export interface CreateSynonymRequest {
    synonyms: string[];
    root?: string;
    locale?: string;
    symbols_to_index?: string[];
}

export interface ListSynonymsResponse {
    synonyms: SynonymResponse[];
}

export async function createSynonym(
    collectionName: string,
    synonymId: string,
    data: CreateSynonymRequest
): Promise<{ success: boolean; data?: SynonymResponse; error?: string }> {
    try {
        const response = await (
            typesenseClient.collections(collectionName) as any
        )
            .synonyms()
            .upsert(synonymId, data);
        
        return { success: true, data: response };
    } catch (error) {
        console.error('Error creating synonym:', error);
        return { 
            success: false, 
            error: error instanceof Error ? error.message : 'Failed to create synonym' 
        };
    }
}

export async function updateSynonym(
    collectionName: string,
    synonymId: string,
    data: CreateSynonymRequest
): Promise<{ success: boolean; data?: SynonymResponse; error?: string }> {
    try {
        const response = await (
            typesenseClient.collections(collectionName) as any
        )
            .synonyms()
            .upsert(synonymId, data);
        
        return { success: true, data: response };
    } catch (error) {
        console.error('Error updating synonym:', error);
        return { 
            success: false, 
            error: error instanceof Error ? error.message : 'Failed to update synonym' 
        };
    }
}

export async function getSynonym(
    collectionName: string,
    synonymId: string
): Promise<{ success: boolean; data?: SynonymResponse; error?: string }> {
    try {
        const response = await (
            typesenseClient.collections(collectionName) as any
        )
            .synonyms(synonymId)
            .retrieve();
        
        return { success: true, data: response };
    } catch (error) {
        console.error('Error retrieving synonym:', error);
        return { 
            success: false, 
            error: error instanceof Error ? error.message : 'Failed to retrieve synonym' 
        };
    }
}

export async function listSynonyms(
    collectionName: string,
    options?: {
        offset?: number;
        limit?: number;
    }
): Promise<{ success: boolean; data?: SynonymResponse[]; error?: string }> {
    try {
        const response = await (
            typesenseClient.collections(collectionName) as any
        )
            .synonyms()
            .retrieve();
        
        return { success: true, data: response.synonyms };
    } catch (error) {
        console.error('Error listing synonyms:', error);
        return { 
            success: false, 
            error: error instanceof Error ? error.message : 'Failed to list synonyms' 
        };
    }
}

export async function deleteSynonym(
    collectionName: string,
    synonymId: string
): Promise<{ success: boolean; error?: string }> {
    try {
        await (
            typesenseClient.collections(collectionName) as any
        )
            .synonyms(synonymId)
            .delete();
        
        return { success: true };
    } catch (error) {
        console.error('Error deleting synonym:', error);
        return { 
            success: false, 
            error: error instanceof Error ? error.message : 'Failed to delete synonym' 
        };
    }
}

export function validateSynonymData(data: CreateSynonymRequest): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!data.synonyms || !Array.isArray(data.synonyms) || data.synonyms.length === 0) {
        errors.push('Synonyms array is required and must not be empty');
    }
    
    if (data.synonyms?.some(synonym => !synonym.trim())) {
        errors.push('All synonyms must be non-empty strings');
    }
    
    if (data.root && !data.root.trim()) {
        errors.push('Root word must be a non-empty string if provided');
    }
    
    if (data.locale && !data.locale.trim()) {
        errors.push('Locale must be a non-empty string if provided');
    }
    
    if (data.symbols_to_index && (!Array.isArray(data.symbols_to_index) || 
        data.symbols_to_index.some(symbol => typeof symbol !== 'string'))) {
        errors.push('Symbols to index must be an array of strings if provided');
    }
    
    return { valid: errors.length === 0, errors };
}