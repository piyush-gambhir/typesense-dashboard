import { getCollections } from '@/lib/typesense/collections';

import TypesenseCollections from '@/components/features/collections/typesense-collections';

export default async function page() {
    const collectionsResult = await getCollections();

    if (!collectionsResult.success) {
        return (
            <div className="flex items-center justify-center min-h-[200px]">
                <p className="text-destructive">
                    Failed to load collections:{' '}
                    {collectionsResult.error || 'Unknown error'}
                </p>
            </div>
        );
    }

    return <TypesenseCollections collections={collectionsResult.data || []} />;
}
