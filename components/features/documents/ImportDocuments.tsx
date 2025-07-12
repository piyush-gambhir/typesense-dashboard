'use client';

import { Download, FileUp, Upload, X } from 'lucide-react';
import { useRef, useState } from 'react';

import {
  type importAction,
  importCollection,
} from '@/lib/typesense/collections';

import { toast } from '@/hooks/useToast';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { ProgressBar } from '@/components/common/ProgressBar';

export default function ImportDocuments({
  collectionName,
}: Readonly<{
  collectionName: string;
}>) {
  const [file, setFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [action, setAction] = useState<importAction>('upsert');
  const [importLog, setImportLog] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setImportLog([]); // Clear import log when new file selected
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setImportLog([]); // Clear import log when file is removed
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleImport = async () => {
    if (!file) {
      toast({
        title: 'Error',
        description: 'Please select a file to import',
        variant: 'destructive',
      });
      return;
    }

    setIsImporting(true);
    setProgress(0);
    setImportLog([]); // Clear import log when starting new import

    try {
      const fileContent = await file.text();
      let documents: Record<string, any>[];

      if (file.name.endsWith('.json')) {
        documents = JSON.parse(fileContent);
      } else if (file.name.endsWith('.jsonl')) {
        documents = fileContent
          .split('\n')
          .filter(Boolean)
          .map((line) => JSON.parse(line));
      } else if (file.name.endsWith('.csv')) {
        const lines = fileContent.split('\n').filter(Boolean);
        if (lines.length === 0) {
          throw new Error('CSV file is empty.');
        }
        const headers = lines[0].split(',').map((header) => header.trim());
        documents = lines.slice(1).map((line) => {
          const values = line.split(',').map((value) => value.trim());
          const doc: Record<string, any> = {};
          headers.forEach((header, index) => {
            doc[header] = values[index];
          });
          return doc;
        });
      } else {
        throw new Error(
          'Unsupported file format. Please use JSON, JSONL, or CSV files.',
        );
      }

      setProgress(25);

      const result = await importCollection(collectionName, action, documents);
      setImportLog(result.log);

      setProgress(75);

      if (result.failureCount > 0) {
        toast({
          title: 'Import Completed with Errors',
          description: `${result.successCount} documents imported successfully, ${result.failureCount} failed.`,
          variant: 'destructive',
        });
        console.error('Import Errors:', result.errors);
      } else {
        toast({
          title: 'Success',
          description: `${result.successCount} documents imported successfully to collection "${collectionName}".`,
          variant: 'default',
        });
      }

      setProgress(100);

      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to import file',
        variant: 'destructive',
      });
    } finally {
      setIsImporting(false);
      setProgress(0);
    }
  };

  const downloadLog = () => {
    const jsonlString = importLog
      .map((entry) => JSON.stringify(entry))
      .join('\n');
    const blob = new Blob([jsonlString], { type: 'application/x-ndjson' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'import-log.jsonl';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto p-8">
      <Card className="shadow-none border-none">
        <CardHeader>
          <CardTitle>Import Documents</CardTitle>
          <CardDescription>Upload and import your documents</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-3">
              <Label htmlFor="file">Select File</Label>
              <Input
                id="file"
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".json,.jsonl,.csv"
                disabled={isImporting}
              />
            </div>

            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Selected file: {file?.name}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemoveFile}
                disabled={isImporting}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-col space-y-3">
              <Label htmlFor="action">Import Action</Label>
              <Select
                disabled={isImporting}
                onValueChange={(value) => setAction(value as importAction)}
                value={action}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Action" />
                </SelectTrigger>
                <SelectContent>
                  {(
                    ['create', 'update', 'upsert', 'emplace'] as importAction[]
                  ).map((actionValue) => (
                    <SelectItem key={actionValue} value={actionValue}>
                      {actionValue.charAt(0).toUpperCase() +
                        actionValue.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {isImporting && (
              <ProgressBar
                isLoading={isImporting}
                progress={progress}
                title="Importing..."
                loadingMessage="Please wait while we import your data."
                completeMessage="Import complete! Processing final steps..."
              />
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleImport} disabled={!file || isImporting}>
            {isImporting ? (
              <>
                <FileUp className="mr-2 h-4 w-4 animate-bounce" />
                Importing...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Import Documents
              </>
            )}
          </Button>
          {importLog.length > 0 && (
            <Button onClick={downloadLog} variant="outline" className="ml-4">
              <Download className="mr-2 h-4 w-4" />
              Download Log
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
