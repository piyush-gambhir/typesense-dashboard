'use client';

import { Download, FileDown } from 'lucide-react';
import { useState } from 'react';

import { exportCollection } from '@/lib/typesense/collections';

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
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

import { ProgressBar } from '@/components/common/ProgressBar';

const jsonToCsv = (jsonData: Record<string, unknown>[]) => {
    const keys = Object.keys(jsonData[0]);
    const csvRows = [
        keys.join(','), // header row
        ...jsonData.map((row) => keys.map((key) => row[key]).join(',')),
    ];
    return csvRows.join('\n');
};

const jsonToXml = (jsonData: Record<string, unknown>[]) => {
    const xmlRows = jsonData.map((row) => {
        let xmlString = '<document>';
        for (const [key, value] of Object.entries(row)) {
            xmlString += `<${key}>${value}</${key}>`;
        }
        xmlString += '</document>';
        return xmlString;
    });

    return `<documents>\n${xmlRows.join('\n')}\n</documents>`;
};

const parseJsonl = (jsonlString: string) => {
    const lines = jsonlString.split('\n').filter(Boolean);
    return lines.map((line) => JSON.parse(line));
};

export default function ExportDocuments({
    collectionName,
}: Readonly<{
    collectionName: string;
}>) {
    const [selectedFormat, setSelectedFormat] = useState<string>('');
    const [isExporting, setIsExporting] = useState(false);
    const [progress, setProgress] = useState(0);
    const handleExport = async () => {
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
            setProgress(10);
            const response = await exportCollection({
                collectionName,
            });

            if (!response) {
                throw new Error('Failed to export collection data');
            }

            let blob;
            let fileName = `${collectionName}-collection-export`;

            setProgress(50);
            const collectionData = parseJsonl(response);

            if (selectedFormat === 'json') {
                // Export as formatted JSON file
                const jsonFormatted = JSON.stringify(collectionData, null, 2);
                blob = new Blob([jsonFormatted], {
                    type: 'application/json',
                });
                fileName += '.json';
            } else if (selectedFormat === 'jsonl') {
                // Export as JSONL
                const jsonlData = collectionData.map((doc) =>
                    JSON.stringify(doc),
                );
                blob = new Blob([jsonlData.join('\n')], {
                    type: 'application/jsonl',
                });
                fileName += '.jsonl';
            } else if (selectedFormat === 'csv') {
                // Export as CSV
                const csvData = jsonToCsv(collectionData);
                blob = new Blob([csvData], {
                    type: 'text/csv',
                });
                fileName += '.csv';
            } else if (selectedFormat === 'xml') {
                // Export as XML
                const xmlData = jsonToXml(collectionData);
                blob = new Blob([xmlData], {
                    type: 'application/xml',
                });
                fileName += '.xml';
            } else {
                throw new Error('Unsupported export format');
            }

            setProgress(100);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast({
                title: 'Success',
                description: `Documents exported in ${selectedFormat.toUpperCase()} format`,
            });
        } catch (error: unknown) {
            toast({
                title: 'Error',
                description:
                    error instanceof Error
                        ? error.message
                        : 'Failed to export documents',
                variant: 'destructive',
            });
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="space-y-6">
            <Card className="border border-border/50 shadow-sm">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-xl font-semibold">Export Documents</CardTitle>
                    <CardDescription className="text-muted-foreground">
                        Export your collection documents to JSON, JSONL, CSV, or XML format
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-3">
                            <Label htmlFor="format" className="text-sm font-medium">
                                Export Format
                            </Label>
                            <Select onValueChange={setSelectedFormat} value={selectedFormat}>
                                <SelectTrigger className="h-11">
                                    <SelectValue placeholder="Choose the format for your exported data" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="json">
                                        <div className="flex flex-col">
                                            <span className="font-medium">JSON</span>
                                            <span className="text-xs text-muted-foreground">Pretty-formatted JSON array</span>
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="jsonl">
                                        <div className="flex flex-col">
                                            <span className="font-medium">JSONL</span>
                                            <span className="text-xs text-muted-foreground">JSON Lines format (one object per line)</span>
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="csv">
                                        <div className="flex flex-col">
                                            <span className="font-medium">CSV</span>
                                            <span className="text-xs text-muted-foreground">Comma-separated values</span>
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="xml">
                                        <div className="flex flex-col">
                                            <span className="font-medium">XML</span>
                                            <span className="text-xs text-muted-foreground">Structured XML format</span>
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Progress Bar */}
                        {isExporting && (
                            <div className="space-y-2">
                                <ProgressBar
                                    isLoading={isExporting}
                                    progress={progress}
                                    title="Exporting..."
                                    loadingMessage="Please wait while we export your data."
                                    completeMessage="Export complete! Downloading..."
                                />
                            </div>
                        )}
                    </div>
                </CardContent>

                <CardFooter className="flex flex-col space-y-4 pt-6">
                    <Button 
                        onClick={handleExport} 
                        disabled={!selectedFormat || isExporting}
                        className="w-full h-11"
                        size="lg"
                    >
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

                    {selectedFormat && !isExporting && (
                        <div className="text-xs text-muted-foreground text-center">
                            Your documents will be exported as a {selectedFormat.toUpperCase()} file
                        </div>
                    )}
                </CardFooter>
            </Card>
        </div>
    );
}
