'use client';

import { Database, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { convertUnixTimestamp } from '@/utils/date-time';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';

// Updated component to accept collections as a prop
export default function TypesenseCollections({
  collections,
}: {
  collections: ReadonlyArray<any>;
}) {
  const router = useRouter();
  
  return (
    <div className="container mx-auto flex flex-col gap-y-8">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 p-8">
        {collections?.map((collection) => {
          const { date, time } = convertUnixTimestamp(collection?.created_at);
          return (
            <Card key={collection?.name} className="flex flex-col shadow-none ">
              <CardHeader>
                <div className="flex justify-between">
                  <CardTitle className="flex items-center">
                    <Database className="mr-2" />
                    {collection?.name}
                  </CardTitle>
                  <Link href={`/collections/${collection.name}/search`}>
                    <Button variant="outline">Search Collection</Button>
                  </Link>
                </div>
                <CardDescription>Collection details</CardDescription>
              </CardHeader>
              <CardContent className="grow">
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Documents</TableCell>
                      <TableCell>{collection?.num_documents}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Fields</TableCell>
                      <TableCell>{collection?.fields?.length}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Created At</TableCell>
                      <TableCell>
                        {date} {time}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      router.push(
                        `/collections/${collection.name}/documents/import`,
                      );
                    }}
                  >
                    Import
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      router.push(
                        `/collections/${collection.name}/documents/export`,
                      );
                    }}
                  >
                    Export
                  </Button>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    router.push(`/collections/${collection.name}`);
                  }}
                >
                  <Search className="mr-2 h-4 w-4" /> View Details
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
