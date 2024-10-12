'use client';

import { FileUp, Upload } from 'lucide-react';
import { useRef, useState } from 'react';

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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';

export default function ImportDocuments() {
  const [file, setFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
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

    try {
      for (let i = 0; i <= 100; i += 10) {
        await new Promise((resolve) => setTimeout(resolve, 200));
        setProgress(i);
      }

      toast({
        title: 'Success',
        description: `File "${file.name}" imported successfully`,
      });
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to import file',
        variant: 'destructive',
      });
    } finally {
      setIsImporting(false);
      setProgress(0);
    }
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
                accept=".csv,.json,.xml"
                disabled={isImporting}
              />
            </div>
            {file && (
              <div className="text-sm text-muted-foreground">
                Selected file: {file.name}
              </div>
            )}
            {isImporting && <Progress value={progress} className="w-full" />}
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
        </CardFooter>
      </Card>
    </div>
  );
}
