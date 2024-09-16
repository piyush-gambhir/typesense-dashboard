"use client";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

import { Database, Search, Settings } from "lucide-react";

import { convertUnixTimestamp } from "@/lib/utils/dateTime";

// Updated component to accept collections as a prop
export default function TypesenseCollections({
  collections,
}: {
  collections: any[];
}) {
  //   const [selectedCollection, setSelectedCollection] = useState(null);

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {collections.map((collection) => {
          const { date, time } = convertUnixTimestamp(collection?.created_at);
          return (
            <Card key={collection.name} className="flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Database className="mr-2" />
                  {collection?.name}
                </CardTitle>
                <CardDescription>Collection details</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
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
                <Button
                  variant="outline"
                  size="sm"
                  // onClick={() => setSelectedCollection(collection)}
                >
                  <Search className="mr-2 h-4 w-4" /> View Details
                </Button>
                <Button variant="outline" size="sm">
                  <Settings className="mr-2 h-4 w-4" /> Settings
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
      {/* {selectedCollection && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Collection Details: {selectedCollection.name}</CardTitle>
            <CardDescription>
              Detailed information about the selected collection
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Property</TableHead>
                  <TableHead>Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Name</TableCell>
                  <TableCell>{selectedCollection?.name}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">
                    Number of Documents
                  </TableCell>
                  <TableCell>{selectedCollection?.num_documents}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">
                    Number of Fields
                  </TableCell>
                  <TableCell>{selectedCollection?.fields?.length}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter>
            <Button
              variant="outline"
              onClick={() => setSelectedCollection(null)}
            >
              Close Details
            </Button>
          </CardFooter>
        </Card>
      )} */}
    </div>
  );
}
