import typesenseClient from '@/lib/typesense/typesense-client';

export async function listSearchOverrides() {
  try {
    // Get all collections first
    const collections = await typesenseClient.collections().retrieve();
    const allOverrides = [];
    
    // Fetch overrides for each collection
    for (const collection of collections) {
      try {
        const overrides = await typesenseClient.collections(collection.name).overrides().retrieve();
        if (overrides.overrides) {
          // Add collection name to each override for display
          const collectionOverrides = overrides.overrides.map((override: any) => ({
            ...override,
            collection_name: collection.name,
          }));
          allOverrides.push(...collectionOverrides);
        }
      } catch (collectionError) {
        console.warn(`Error fetching overrides for collection ${collection.name}:`, collectionError);
      }
    }
    
    return allOverrides;
  } catch (error) {
    console.error('Error listing search overrides:', error);
    return null;
  }
}

export async function createSearchOverride(collectionName: string, overrideId: string, override: Record<string, any>) {
  try {
    const newOverride = await typesenseClient.collections(collectionName).overrides().upsert(overrideId, override);
    return newOverride;
  } catch (error) {
    console.error('Error creating search override:', error);
    return null;
  }
}

export async function deleteSearchOverride(collectionName: string, overrideId: string) {
  try {
    const deleteResult = await typesenseClient.collections(collectionName).overrides(overrideId).delete();
    return deleteResult;
  } catch (error) {
    console.error('Error deleting search override:', error);
    return null;
  }
}
