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
    const [importLog, setImportLog] = useState<Record<string, unknown>[]>([]);
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
            let documents: Record<string, unknown>[];

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
                const headers = lines[0]
                    .split(',')
                    .map((header) => header.trim());
                documents = lines.slice(1).map((line) => {
                    const values = line.split(',').map((value) => value.trim());
                    const doc: Record<string, unknown> = {};
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

            const result = await importCollection(
                collectionName,
                action,
                documents,
            );
            setImportLog(result.log as unknown as Record<string, unknown>[]);

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
        <div className="space-y-6">
            <Card className="border border-border/50 shadow-sm">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-xl font-semibold">Import Documents</CardTitle>
                    <CardDescription className="text-muted-foreground">
                        Upload JSON, JSONL, or CSV files to import documents into your collection
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid w-full items-center gap-6">
                        {/* File Upload Area */}
                        <div className="space-y-3">
                            <Label htmlFor="file" className="text-sm font-medium">
                                Upload File
                            </Label>
                            <div className="relative">
                                <div className={`
                                    border-2 border-dashed rounded-lg p-8 text-center transition-colors
                                    ${file ? 'border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20' : 'border-muted-foreground/25 hover:border-muted-foreground/40'}
                                    ${isImporting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                                `}>
                                    <Input
                                        id="file"
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                        accept=".json,.jsonl,.csv"
                                        disabled={isImporting}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                    <div className="space-y-3">
                                        {file ? (
                                            <>
                                                <FileUp className="mx-auto h-8 w-8 text-green-600 dark:text-green-400" />
                                                <div className="space-y-1">
                                                    <p className="text-sm font-medium text-green-700 dark:text-green-300">
                                                        {file.name}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {(file.size / 1024 / 1024).toFixed(2)} MB
                                                    </p>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={handleRemoveFile}
                                                    disabled={isImporting}
                                                    className="mt-2"
                                                >
                                                    <X className="h-4 w-4 mr-1" />
                                                    Remove
                                                </Button>
                                            </>
                                        ) : (
                                            <>
                                                <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                                                <div className="space-y-1">
                                                    <p className="text-sm font-medium">
                                                        Drop your file here or click to browse
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        Supports JSON, JSONL, and CSV files
                                                    </p>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Import Action */}
                        <div className="space-y-3">
                            <Label htmlFor="action" className="text-sm font-medium">
                                Import Action
                            </Label>
                            <Select
                                disabled={isImporting}
                                onValueChange={(value) =>
                                    setAction(value as importAction)
                                }
                                value={action}
                            >
                                <SelectTrigger className="h-11">
                                    <SelectValue placeholder="Select how to handle existing documents" />
                                </SelectTrigger>
                                <SelectContent>
                                    {(
                                        [
                                            { value: 'create', label: 'Create', description: 'Only create new documents (fail if exists)' },
                                            { value: 'update', label: 'Update', description: 'Only update existing documents (fail if not exists)' },
                                            { value: 'upsert', label: 'Upsert', description: 'Create new or update existing documents' },
                                            { value: 'emplace', label: 'Emplace', description: 'Create or replace existing documents' },
                                        ] as Array<{ value: importAction; label: string; description: string }>
                                    ).map((actionItem) => (
                                        <SelectItem
                                            key={actionItem.value}
                                            value={actionItem.value}
                                        >
                                            <div className="flex flex-col">
                                                <span className="font-medium">{actionItem.label}</span>
                                                <span className="text-xs text-muted-foreground">{actionItem.description}</span>
                                            </div>
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
                <CardFooter className="flex flex-col space-y-4 pt-6">
                    <div className="flex flex-col sm:flex-row gap-3 w-full">
                        <Button
                            onClick={handleImport}
                            disabled={!file || isImporting}
                            className="flex-1 h-11"
                            size="lg"
                        >
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
                            <Button
                                onClick={downloadLog}
                                variant="outline"
                                className="h-11"
                                size="lg"
                            >
                                <Download className="mr-2 h-4 w-4" />
                                Download Log
                            </Button>
                        )}
                    </div>
                    
                    {importLog.length > 0 && (
                        <div className="text-xs text-muted-foreground text-center">
                            Import log contains {importLog.length} entries with detailed results
                        </div>
                    )}
                </CardFooter>
            </Card>
        </div>
    );
}
