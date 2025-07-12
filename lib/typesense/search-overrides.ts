import typesenseClient from '@/lib/typesense/typesense-client';

export interface SearchOverride {
    id: string;
    collection_name: string;
    rule: {
        query: string;
        match?: 'exact' | 'contains';
    };
    applies_to: 'always' | 'on_match';
    force_include?: Array<{ id: string; position?: number }>;
    force_exclude?: Array<{ id: string }>;
    stop_words?: string[];
    filter_by?: string;
    sort_by?: string;
}

export async function listSearchOverrides() {
    try {
        // Get all collections first
        const collections = await typesenseClient.collections().retrieve();
        const allOverrides = [];

        // Fetch overrides for each collection
        for (const collection of collections) {
            try {
                const overrides = await typesenseClient
                    .collections(collection.name)
                    .overrides()
                    .retrieve();
                if (overrides.overrides) {
                    // Add collection name to each override for display
                    const collectionOverrides = overrides.overrides.map(
                        (override: any) => ({
                            ...override,
                            collection_name: collection.name,
                        }),
                    );
                    allOverrides.push(...collectionOverrides);
                }
            } catch (collectionError) {
                console.warn(
                    `Error fetching overrides for collection ${collection.name}:`,
                    collectionError,
                );
            }
        }

        return allOverrides;
    } catch (error) {
        console.error('Error listing search overrides:', error);
        return null;
    }
}

export async function getSearchOverride(
    collectionName: string,
    overrideId: string,
) {
    try {
        const override = await typesenseClient
            .collections(collectionName)
            .overrides(overrideId)
            .retrieve();
        return override;
    } catch (error) {
        console.error('Error getting search override:', error);
        return null;
    }
}

export async function createSearchOverride(
    collectionName: string,
    overrideId: string,
    override: any,
) {
    try {
        const newOverride = await typesenseClient
            .collections(collectionName)
            .overrides()
            .upsert(overrideId, override);
        return newOverride;
    } catch (error) {
        console.error('Error creating search override:', error);
        return null;
    }
}

export async function updateSearchOverride(
    collectionName: string,
    overrideId: string,
    override: any,
) {
    try {
        const updatedOverride = await typesenseClient
            .collections(collectionName)
            .overrides()
            .upsert(overrideId, override);
        return updatedOverride;
    } catch (error) {
        console.error('Error updating search override:', error);
        return null;
    }
}

export async function deleteSearchOverride(
    collectionName: string,
    overrideId: string,
) {
    try {
        const deleteResult = await typesenseClient
            .collections(collectionName)
            .overrides(overrideId)
            .delete();
        return deleteResult;
    } catch (error) {
        console.error('Error deleting search override:', error);
        return null;
    }
}

// Helper function to validate override data
export function validateOverrideData(override: any): {
    valid: boolean;
    errors: string[];
} {
    const errors: string[] = [];

    if (!override.rule?.query) {
        errors.push('Query is required in the rule');
    }

    if (
        override.applies_to &&
        !['always', 'on_match'].includes(override.applies_to)
    ) {
        errors.push('Applies to must be either "always" or "on_match"');
    }

    if (override.force_include && !Array.isArray(override.force_include)) {
        errors.push('Force include must be an array');
    }

    if (override.force_exclude && !Array.isArray(override.force_exclude)) {
        errors.push('Force exclude must be an array');
    }

    if (override.stop_words && !Array.isArray(override.stop_words)) {
        errors.push('Stop words must be an array');
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}
