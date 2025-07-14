import { getTypesenseClient } from "@/lib/typesense/typesense-client";

export async function createApiKey(
    description: string,
    actions: string[],
    collections: string[],
) {
    try {
        const typesenseClient = getTypesenseClient();        return await typesenseClient.keys().create({
            description,
            actions,
            collections,
        });
    } catch (error) {
        console.error('Error creating API key:', error);
        throw error;
    }
}

export async function retrieveApiKeyById(keyId: number) {
    try {
        const typesenseClient = getTypesenseClient();        return await typesenseClient.keys(keyId).retrieve();
    } catch (error) {
        console.error('Error retrieving API key:', error);
        throw error;
    }
}

export async function listApiKeys() {
    try {
        const typesenseClient = getTypesenseClient();        return await typesenseClient.keys().retrieve();
    } catch (error) {
        console.error('Error listing API keys:', error);
        throw error;
    }
}

export async function deleteApiKey(keyId: number) {
    try {
        const typesenseClient = getTypesenseClient();        return await typesenseClient.keys(keyId).delete();
    } catch (error) {
        console.error('Error deleting API key:', error);
        throw error;
    }
}
