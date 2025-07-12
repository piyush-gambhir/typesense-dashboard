'use client';

import { Download, FileUp, Trash2, Upload, X } from 'lucide-react';
import { useRef, useState } from 'react';

import {
    bulkCreateDocuments,
    bulkDeleteDocuments,
    bulkUpdateDocuments,
    bulkUpsertDocuments,
    validateDocument,
} from '@/lib/typesense/documents';

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
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

import { ProgressBar } from '@/components/common/ProgressBar';

type BulkOperation = 'create' | 'update' | 'upsert' | 'delete';

interface BulkOperationsProps {
    collectionName: string;
}

export default function BulkOperations({
    collectionName,
}: Readonly<BulkOperationsProps>) {
    const [operation, setOperation] = useState<BulkOperation>('create');
    const [file, setFile] = useState<File | null>(null);
    const [jsonInput, setJsonInput] = useState<string>('');
    const [useFile, setUseFile] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [results, setResults] = useState<any>(null);
    const [documentIds, setDocumentIds] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setResults(null);
        }
    };

    const handleRemoveFile = () => {
        setFile(null);
        setResults(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const parseDocuments = async (): Promise<Record<string, unknown>[]> => {
        if (useFile && file) {
            const fileContent = await file.text();
            if (file.name.endsWith('.json')) {
                return JSON.parse(fileContent);
            } else if (file.name.endsWith('.jsonl')) {
                return fileContent
                    .split('\n')
                    .filter(Boolean)
                    .map((line) => JSON.parse(line));
            } else {
                throw new Error(
                    'Unsupported file format. Please use JSON or JSONL files.',
                );
            }
        } else if (!useFile && jsonInput.trim()) {
            try {
                return JSON.parse(jsonInput);
            } catch (error) {
                throw new Error('Invalid JSON format');
            }
        } else {
            throw new Error('Please provide documents to process');
        }
    };

    const handleBulkOperation = async () => {
        setIsProcessing(true);
        setProgress(0);
        setResults(null);

        try {
            let result;

            if (operation === 'delete') {
                // Handle bulk delete by IDs
                const ids = documentIds
                    .split('\n')
                    .map((id) => id.trim())
                    .filter(Boolean);

                if (ids.length === 0) {
                    throw new Error('Please provide document IDs to delete');
                }

                setProgress(25);
                result = await bulkDeleteDocuments(collectionName, ids);
            } else {
                // Handle bulk create/update/upsert
                const documents = await parseDocuments();

                if (documents.length === 0) {
                    throw new Error('No documents provided');
                }

                setProgress(25);

                // Validate documents if not delete operation
                const validationResults = await Promise.all(
                    documents.map((doc) =>
                        validateDocument(collectionName, doc),
                    ),
                );

                const invalidDocs = validationResults.filter(
                    (result) => !result.isValid,
                );
                if (invalidDocs.length > 0) {
                    const errors = invalidDocs.flatMap(
                        (result) => result.errors || [],
                    );
                    throw new Error(`Validation errors: ${errors.join(', ')}`);
                }

                setProgress(50);

                switch (operation) {
                    case 'create':
                        result = await bulkCreateDocuments(
                            collectionName,
                            documents,
                        );
                        break;
                    case 'update':
                        result = await bulkUpdateDocuments(
                            collectionName,
                            documents,
                        );
                        break;
                    case 'upsert':
                        result = await bulkUpsertDocuments(
                            collectionName,
                            documents,
                        );
                        break;
                }
            }

            setProgress(75);
            setResults(result);

            if (result?.success) {
                const successCount = result.successCount || 0;
                const failureCount = result.failureCount || 0;

                if (failureCount > 0) {
                    toast({
                        title: 'Operation Completed with Errors',
                        description: `${successCount} documents processed successfully, ${failureCount} failed.`,
                        variant: 'destructive',
                    });
                } else {
                    toast({
                        title: 'Success',
                        description: `${successCount} documents processed successfully.`,
                    });
                }
            } else {
                toast({
                    title: 'Error',
                    description: result?.error || 'Operation failed',
                    variant: 'destructive',
                });
            }

            setProgress(100);
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error?.message || 'Operation failed',
                variant: 'destructive',
            });
        } finally {
            setIsProcessing(false);
            setProgress(0);
        }
    };

    const downloadResults = () => {
        if (!results) return;

        const jsonString = JSON.stringify(results, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bulk-${operation}-results.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const isDeleteOperation = operation === 'delete';

    return (
        <div className="container mx-auto p-8">
            <Card className="shadow-none border-none">
                <CardHeader>
                    <CardTitle>Bulk Document Operations</CardTitle>
                    <CardDescription>
                        Perform bulk operations on documents in the{' '}
                        {collectionName} collection
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid w-full items-center gap-6">
                        <div className="flex flex-col space-y-3">
                            <Label htmlFor="operation">Operation Type</Label>
                            <Select
                                disabled={isProcessing}
                                onValueChange={(value) =>
                                    setOperation(value as BulkOperation)
                                }
                                value={operation}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Operation" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="create">
                                        Create
                                    </SelectItem>
                                    <SelectItem value="update">
                                        Update
                                    </SelectItem>
                                    <SelectItem value="upsert">
                                        Upsert
                                    </SelectItem>
                                    <SelectItem value="delete">
                                        Delete
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {!isDeleteOperation && (
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="useFile"
                                    checked={useFile}
                                    onCheckedChange={(checked) =>
                                        setUseFile(checked as boolean)
                                    }
                                    disabled={isProcessing}
                                />
                                <Label htmlFor="useFile">Use file upload</Label>
                            </div>
                        )}

                        {!isDeleteOperation && useFile && (
                            <>
                                <div className="flex flex-col space-y-3">
                                    <Label htmlFor="file">Select File</Label>
                                    <Input
                                        id="file"
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                        accept=".json,.jsonl"
                                        disabled={isProcessing}
                                    />
                                </div>

                                <div className="flex items-center justify-between text-sm text-muted-foreground">
                                    <span>Selected file: {file?.name}</span>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleRemoveFile}
                                        disabled={isProcessing}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            </>
                        )}

                        {!isDeleteOperation && !useFile && (
                            <div className="flex flex-col space-y-3">
                                <Label htmlFor="jsonInput">
                                    Documents JSON
                                </Label>
                                <Textarea
                                    id="jsonInput"
                                    placeholder="Enter documents as JSON array..."
                                    value={jsonInput}
                                    onChange={(e) =>
                                        setJsonInput(e.target.value)
                                    }
                                    disabled={isProcessing}
                                    rows={10}
                                />
                            </div>
                        )}

                        {isDeleteOperation && (
                            <div className="flex flex-col space-y-3">
                                <Label htmlFor="documentIds">
                                    Document IDs (one per line)
                                </Label>
                                <Textarea
                                    id="documentIds"
                                    placeholder="Enter document IDs, one per line..."
                                    value={documentIds}
                                    onChange={(e) =>
                                        setDocumentIds(e.target.value)
                                    }
                                    disabled={isProcessing}
                                    rows={5}
                                />
                            </div>
                        )}

                        {isProcessing && (
                            <ProgressBar
                                isLoading={isProcessing}
                                progress={progress}
                                title="Processing..."
                                loadingMessage="Please wait while we process your documents."
                                completeMessage="Processing complete!"
                            />
                        )}

                        {results && (
                            <div className="border rounded-lg p-4 bg-muted/50">
                                <h4 className="font-semibold mb-2">Results</h4>
                                <div className="text-sm space-y-1">
                                    <p>Success: {results.successCount || 0}</p>
                                    <p>Failed: {results.failureCount || 0}</p>
                                    {results.errors &&
                                        results.errors.length > 0 && (
                                            <div>
                                                <p className="font-medium text-destructive">
                                                    Errors:
                                                </p>
                                                <ul className="list-disc list-inside text-xs">
                                                    {results.errors
                                                        .slice(0, 5)
                                                        .map(
                                                            (
                                                                error: string,
                                                                index: number,
                                                            ) => (
                                                                <li key={index}>
                                                                    {error}
                                                                </li>
                                                            ),
                                                        )}
                                                    {results.errors.length >
                                                        5 && (
                                                        <li>
                                                            ... and{' '}
                                                            {results.errors
                                                                .length -
                                                                5}{' '}
                                                            more
                                                        </li>
                                                    )}
                                                </ul>
                                            </div>
                                        )}
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
                <CardFooter className="flex gap-4">
                    <Button
                        onClick={handleBulkOperation}
                        disabled={
                            isProcessing ||
                            (!isDeleteOperation &&
                                !file &&
                                !jsonInput.trim()) ||
                            (isDeleteOperation && !documentIds.trim())
                        }
                    >
                        {isProcessing ? (
                            <>
                                <FileUp className="mr-2 h-4 w-4 animate-bounce" />
                                Processing...
                            </>
                        ) : (
                            <>
                                {isDeleteOperation ? (
                                    <Trash2 className="mr-2 h-4 w-4" />
                                ) : (
                                    <Upload className="mr-2 h-4 w-4" />
                                )}
                                {operation.charAt(0).toUpperCase() +
                                    operation.slice(1)}{' '}
                                Documents
                            </>
                        )}
                    </Button>

                    {results && (
                        <Button onClick={downloadResults} variant="outline">
                            <Download className="mr-2 h-4 w-4" />
                            Download Results
                        </Button>
                    )}
                </CardFooter>
            </Card>
        </div>
    );
}
