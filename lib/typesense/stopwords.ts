import { getTypesenseClient } from "@/lib/typesense/typesense-client";

export async function listStopwords(collectionName: string) {
    try {
        const typesenseClient = getTypesenseClient();
        const stopwordsResult = await (
            typesenseClient.collections(collectionName) as any
        )
            .stopwords()
            .retrieve();
        return (stopwordsResult as { stopwords: string[] }).stopwords;
    } catch (error) {
        console.error('Error listing stopwords:', error);
        return null;
    }
}

export async function upsertStopwords(
    collectionName: string,
    stopwordsId: string,
    stopwords: Record<string, any>,
) {
    try {
        const typesenseClient = getTypesenseClient();
        const newStopwords = await (
            typesenseClient.collections(collectionName) as any
        )
            .stopwords()
            .upsert(stopwordsId, stopwords);
        return newStopwords;
    } catch (error) {
        console.error('Error upserting stopwords:', error);
        return null;
    }
}

export async function deleteStopwords(
    collectionName: string,
    stopwordsId: string,
) {
    try {
        const typesenseClient = getTypesenseClient();
        const deleteResult = await (
            typesenseClient.collections(collectionName) as any
        )
            .stopwords(stopwordsId)
            .delete();
        return deleteResult;
    } catch (error) {
        console.error('Error deleting stopwords:', error);
        return null;
    }
}
