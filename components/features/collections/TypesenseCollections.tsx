'use client';

import { Database, Search, FileText, Calendar, Hash, Import, Download, ExternalLink } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from '@/components/link';
import { convertUnixTimestamp } from '@/utils/date-time';
import CreateCollectionDialog from '@/components/features/collections/CreateCollectionDialog';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Updated component to accept collections as a prop
export default function TypesenseCollections({
  collections,
}: {
  collections: ReadonlyArray<any>;
}) {
  const router = useRouter();

  if (!collections || collections.length === 0) {
    return (
      <div className="container mx-auto p-4 md:p-8 flex flex-col gap-y-4">
        <Card className="border-none shadow-none">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Collections</CardTitle>
                <CardDescription>
                  Manage your Typesense collections and their configurations
                </CardDescription>
              </div>
              <CreateCollectionDialog />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-64">
              <div className="text-center space-y-6 max-w-md">
                <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                  <Database className="h-8 w-8 text-muted-foreground" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">No collections found</h3>
                  <p className="text-muted-foreground">
                    Get started by creating your first collection to store and search your data.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-4 md:p-8 flex flex-col gap-y-4">
      <Card className="border-none shadow-none">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Collections</CardTitle>
              <CardDescription>
                Manage your Typesense collections and their configurations
              </CardDescription>
            </div>
            <CreateCollectionDialog />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {collections?.map((collection) => {
              const { date } = convertUnixTimestamp(collection?.created_at);
              return (
                <Card key={collection?.name} className="w-full flex flex-col justify-between">
                  <CardContent className="p-4 md:p-6">
                    <div className="space-y-4">
                      {/* Header with icon and badge */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3 min-w-0 flex-1">
                          <div className="flex-shrink-0 p-2 bg-primary/10 rounded-lg">
                            <Database className="h-5 w-5 text-primary" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="text-lg font-semibold truncate">
                              {collection?.name}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Collection details
                            </p>
                          </div>
                        </div>
                        <Badge variant="secondary" className="flex-shrink-0 ml-2">
                          {collection?.fields?.length} fields
                        </Badge>
                      </div>
                      
                      {/* Collection stats */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-muted-foreground">
                            <FileText className="h-4 w-4 mr-2 flex-shrink-0" />
                            <span className="text-sm">Documents</span>
                          </div>
                          <span className="font-medium text-sm">
                            {collection?.num_documents?.toLocaleString()}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-muted-foreground">
                            <Hash className="h-4 w-4 mr-2 flex-shrink-0" />
                            <span className="text-sm">Fields</span>
                          </div>
                          <span className="font-medium text-sm">
                            {collection?.fields?.length}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-muted-foreground">
                            <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                            <span className="text-sm">Created</span>
                          </div>
                          <span className="font-medium text-sm">
                            {date}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  
                  {/* Action buttons */}
                  <CardContent className="pt-4 border-t">
                    <div className="space-y-3">
                      {/* Primary Actions */}
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => {
                            router.push(`/collections/${collection.name}`);
                          }}
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                        <Link href={`/collections/${collection.name}/search`} className="flex-1">
                          <Button variant="default" size="sm" className="w-full">
                            <Search className="h-4 w-4 mr-2" />
                            Search
                          </Button>
                        </Link>
                      </div>
                      
                      {/* Secondary Actions */}
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => {
                            router.push(`/collections/${collection.name}/documents/import`);
                          }}
                        >
                          <Import className="h-4 w-4 mr-2" />
                          Import
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => {
                            router.push(`/collections/${collection.name}/documents/export`);
                          }}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Export
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
