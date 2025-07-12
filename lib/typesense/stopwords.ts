import typesenseClient from '@/lib/typesense/typesense-client';

export async function listStopwords(collectionName: string) {
  try {
    const stopwords = await typesenseClient.collections(collectionName).stopwords().retrieve();
    return stopwords.stopwords;
  } catch (error) {
    console.error('Error listing stopwords:', error);
    return null;
  }
}

export async function upsertStopwords(collectionName: string, stopwordsId: string, stopwords: Record<string, any>) {
  try {
    const newStopwords = await typesenseClient.collections(collectionName).stopwords().upsert(stopwordsId, stopwords);
    return newStopwords;
  } catch (error) {
    console.error('Error upserting stopwords:', error);
    return null;
  }
}

export async function deleteStopwords(collectionName: string, stopwordsId: string) {
  try {
    const deleteResult = await typesenseClient.collections(collectionName).stopwords(stopwordsId).delete();
    return deleteResult;
  } catch (error) {
    console.error('Error deleting stopwords:', error);
    return null;
  }
}
