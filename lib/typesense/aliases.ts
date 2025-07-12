import typesenseClient from '@/lib/typesense/typesense-client';

export async function listAliases() {
    try {
        const aliases = await typesenseClient.aliases().retrieve();
        return aliases.aliases;
    } catch (error) {
        console.error('Error listing aliases:', error);
        return null;
    }
}

export async function getAlias(aliasName: string) {
    try {
        const alias = await typesenseClient.aliases(aliasName).retrieve();
        return alias;
    } catch (error) {
        console.error('Error getting alias:', error);
        return null;
    }
}

export async function createAlias(aliasName: string, collectionName: string) {
    try {
        const newAlias = await typesenseClient.aliases().upsert(aliasName, {
            collection_name: collectionName,
        });
        return newAlias;
    } catch (error) {
        console.error('Error creating alias:', error);
        return null;
    }
}

export async function updateAlias(aliasName: string, collectionName: string) {
    try {
        const updatedAlias = await typesenseClient.aliases().upsert(aliasName, {
            collection_name: collectionName,
        });
        return updatedAlias;
    } catch (error) {
        console.error('Error updating alias:', error);
        return null;
    }
}

export async function deleteAlias(aliasName: string) {
    try {
        const deleteResult = await typesenseClient.aliases(aliasName).delete();
        return deleteResult;
    } catch (error) {
        console.error('Error deleting alias:', error);
        return null;
    }
}
