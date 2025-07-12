import { Terminal } from 'lucide-react';
import React from 'react';

import { getCollection } from '@/lib/typesense/collections';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import CollectionBackupRestore from '@/components/features/collections/CollectionBackupRestore';
import CollectionConfigManager from '@/components/features/collections/CollectionConfigManager';
import CollectionFieldManager from '@/components/features/collections/CollectionFieldManager';
import CollectionStats from '@/components/features/collections/CollectionStats';

export default async function CollectionManagementPage({
    params,
}: {
    params: Promise<{ collectionName: string }>;
}) {
    const { collectionName } = await params;
    const collectionResult = await getCollection(collectionName);

    if (
        !collectionResult ||
        !collectionResult.success ||
        !collectionResult.data
    ) {
        return (
            <div className="container mx-auto flex flex-col gap-y-8 p-8">
                <Alert variant="destructive">
                    <Terminal className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>
                        {collectionResult?.error ||
                            `Collection '${collectionName}' not found.`}
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 md:p-8">
            <div className="mb-6">
                <h1 className="text-3xl font-bold">Collection Management</h1>
                <p className="text-muted-foreground mt-2">
                    Advanced management tools for collection '{collectionName}'
                </p>
            </div>

            <Tabs defaultValue="stats" className="space-y-6">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="stats">Statistics</TabsTrigger>
                    <TabsTrigger value="fields">Field Management</TabsTrigger>
                    <TabsTrigger value="backup">Backup & Restore</TabsTrigger>
                    <TabsTrigger value="config">Configuration</TabsTrigger>
                </TabsList>

                <TabsContent value="stats" className="space-y-6">
                    <CollectionStats collectionName={collectionName} />
                </TabsContent>

                <TabsContent value="fields" className="space-y-6">
                    <CollectionFieldManager collectionName={collectionName} />
                </TabsContent>

                <TabsContent value="backup" className="space-y-6">
                    <CollectionBackupRestore collectionName={collectionName} />
                </TabsContent>

                <TabsContent value="config" className="space-y-6">
                    <CollectionConfigManager collectionName={collectionName} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
