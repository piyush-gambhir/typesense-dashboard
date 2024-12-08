import typesenseClient from '@/lib/typesense/typesense-client';

// Retrieve all API keys
export async function getApiKeys() {
  try {
    const apiKeys = await typesenseClient.keys().retrieve();
    return apiKeys;
  } catch (error) {
    console.error('Error fetching API keys:', error);
    return null;
  }
}

// Retrieve a specific API key by its ID
export async function getApiKeyById(apiKeyId: string) {
  try {
    const apiKey = await typesenseClient.keys(Number(apiKeyId)).retrieve();
    return apiKey;
  } catch (error) {
    console.error(`Error fetching API key "${apiKeyId}":`, error);
    return null;
  }
}

// Create a new API key
export async function createApiKey(
  description: string,
  actions: string[],
  collections: string[],
) {
  try {
    const newApiKey = await typesenseClient.keys().create({
      description,
      actions,
      collections,
    });
    return newApiKey;
  } catch (error) {
    console.error('Error creating API key:', error);
    return null;
  }
}

// Delete an API key by its ID
export async function deleteApiKey(apiKeyId: string) {
  try {
    const deleteResult = await typesenseClient.keys(Number(apiKeyId)).delete();
    return deleteResult;
  } catch (error) {
    console.error(`Error deleting API key "${apiKeyId}":`, error);
    return null;
  }
}
