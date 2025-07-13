'use client';

import Editor from '@monaco-editor/react';
import { Hash, ToggleLeft } from 'lucide-react';

import { cn } from '@/lib/utils';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import SchemaFieldsTable from './SchemaFieldsTable';

interface Field {
    name: string;
    type: string;
    facet?: boolean;
    index?: boolean;
    optional?: boolean;
    sort?: boolean;
    store?: boolean;
}

interface SchemaManagementProps {
    fields: Field[];
    isJsonMode: boolean;
    jsonSchema: string;
    onJsonModeChange: (isJson: boolean) => void;
    onJsonSchemaChange: (value: string) => void;
    onFieldChange: (index: number, key: keyof Field, value: boolean | string) => void;
}

export default function SchemaManagement({
    fields,
    isJsonMode,
    jsonSchema,
    onJsonModeChange,
    onJsonSchemaChange,
    onFieldChange
}: SchemaManagementProps) {
    return (
        <Card className="border border-border/50">
            <CardHeader>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <CardTitle className="flex items-center gap-2">
                            <Hash className="h-5 w-5" />
                            Schema Fields
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                            Manage your collection's field schema and properties
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 bg-muted/50 rounded-lg p-1">
                            <button
                                onClick={() => onJsonModeChange(false)}
                                className={cn(
                                    "px-3 py-1 text-sm font-medium rounded-md transition-colors",
                                    !isJsonMode ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                Table
                            </button>
                            <button
                                onClick={() => onJsonModeChange(true)}
                                className={cn(
                                    "px-3 py-1 text-sm font-medium rounded-md transition-colors",
                                    isJsonMode ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                JSON
                            </button>
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <Alert>
                    <ToggleLeft className="h-4 w-4" />
                    <AlertDescription>
                        <strong>Schema Limitations:</strong> Typesense only allows adding new fields to existing collections. 
                        You cannot modify field types, delete existing fields, or change existing field properties. 
                        To change field properties, you'll need to recreate the collection.
                    </AlertDescription>
                </Alert>
                {isJsonMode ? (
                    <div className="border rounded-xl overflow-hidden bg-gradient-to-br from-background to-muted/20">
                        <Editor
                            height="500px"
                            defaultLanguage="json"
                            value={jsonSchema}
                            onChange={(value) => onJsonSchemaChange(value || '')}
                            options={{
                                minimap: { enabled: false },
                                fontSize: 14,
                                lineNumbers: 'on',
                                roundedSelection: false,
                                scrollBeyondLastLine: false,
                                automaticLayout: true,
                                theme: 'vs-dark',
                                wordWrap: 'on',
                                padding: { top: 16, bottom: 16 },
                            }}
                        />
                    </div>
                ) : (
                    <SchemaFieldsTable
                        fields={fields}
                        onFieldChange={onFieldChange}
                    />
                )}
            </CardContent>
        </Card>
    );
}