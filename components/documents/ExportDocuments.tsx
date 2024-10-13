'use client';

import { Download, FileDown } from 'lucide-react';
import { useState } from 'react';

import { exportCollection } from '@/lib/typesense/actions/collections';

import { toast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function ExportDocuments({
  collectionName,
}: {
  collectionName: string;
}) {
  const [selectedFormat, setSelectedFormat] = useState<string>('');
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    const collectionData = await exportCollection({ collectionName });
    if (!selectedFormat) {
      toast({
        title: 'Error',
        description: 'Please select an export format',
        variant: 'destructive',
      });
      return;
    }

    setIsExporting(true);
    try {
      // Simulating an export process
      await new Promise((resolve) => setTimeout(resolve, 2000));
      toast({
        title: 'Success',
        description: `Documents exported in ${selectedFormat} format`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to export documents',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <Card className="shadow-none border-none">
        <CardHeader>
          <CardTitle>Export Documents</CardTitle>
          <CardDescription>
            Export your documents in various formats
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Select onValueChange={setSelectedFormat}>
                <SelectTrigger>
                  <SelectValue placeholder="Select export format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="xml">XML</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleExport} disabled={isExporting}>
            {isExporting ? (
              <>
                <FileDown className="mr-2 h-4 w-4 animate-bounce" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Export Documents
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
