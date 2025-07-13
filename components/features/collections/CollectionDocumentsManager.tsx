'use client';

import { BarChart3, Download, FileText, Import, Search, Upload } from 'lucide-react';
import { useState } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import BulkOperations from '@/components/features/documents/BulkOperations';
import DocumentStats from '@/components/features/documents/DocumentStats';
import DocumentSuggestions from '@/components/features/documents/DocumentSuggestions';
import DocumentValidator from '@/components/features/documents/DocumentValidator';
import ExportDocuments from '@/components/features/documents/ExportDocuments';
import ImportDocuments from '@/components/features/documents/ImportDocuments';

interface CollectionDocumentsManagerProps {
    collectionName: string;
}

export default function CollectionDocumentsManager({ collectionName }: CollectionDocumentsManagerProps) {
    const [activeTab, setActiveTab] = useState('overview');

    return (
        <div className="container mx-auto px-4 py-8 space-y-8">
            {/* Header */}
            <div className="space-y-3">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-blue-500/20 to-blue-500/10 rounded-xl ring-1 ring-blue-500/20">
                        <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Document Management</h1>
                        <p className="text-muted-foreground">Manage documents in collection '{collectionName}'</p>
                    </div>
                </div>
            </div>

            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="border border-border/50 hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Import Data
                            </CardTitle>
                            <Import className="h-5 w-5 text-emerald-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            Upload JSON, CSV, or JSONL files to add documents to your collection
                        </p>
                    </CardContent>
                </Card>

                <Card className="border border-border/50 hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Export Data
                            </CardTitle>
                            <Download className="h-5 w-5 text-blue-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            Download your collection data in various formats
                        </p>
                    </CardContent>
                </Card>

                <Card className="border border-border/50 hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Bulk Operations
                            </CardTitle>
                            <Upload className="h-5 w-5 text-purple-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            Perform batch operations on multiple documents
                        </p>
                    </CardContent>
                </Card>

                <Card className="border border-border/50 hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Analytics
                            </CardTitle>
                            <BarChart3 className="h-5 w-5 text-amber-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            View collection statistics and document insights
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Tabbed Interface */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-6">
                    <TabsTrigger value="overview" className="gap-2">
                        <BarChart3 className="h-4 w-4" />
                        Overview
                    </TabsTrigger>
                    <TabsTrigger value="import" className="gap-2">
                        <Import className="h-4 w-4" />
                        Import
                    </TabsTrigger>
                    <TabsTrigger value="export" className="gap-2">
                        <Download className="h-4 w-4" />
                        Export
                    </TabsTrigger>
                    <TabsTrigger value="bulk" className="gap-2">
                        <Upload className="h-4 w-4" />
                        Bulk Ops
                    </TabsTrigger>
                    <TabsTrigger value="validator" className="gap-2">
                        <Search className="h-4 w-4" />
                        Validator
                    </TabsTrigger>
                    <TabsTrigger value="suggestions" className="gap-2">
                        <FileText className="h-4 w-4" />
                        Suggestions
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                    <DocumentStats collectionName={collectionName} />
                </TabsContent>

                <TabsContent value="import" className="space-y-6">
                    <ImportDocuments collectionName={collectionName} />
                </TabsContent>

                <TabsContent value="export" className="space-y-6">
                    <ExportDocuments collectionName={collectionName} />
                </TabsContent>

                <TabsContent value="bulk" className="space-y-6">
                    <BulkOperations collectionName={collectionName} />
                </TabsContent>

                <TabsContent value="validator" className="space-y-6">
                    <DocumentValidator collectionName={collectionName} />
                </TabsContent>

                <TabsContent value="suggestions" className="space-y-6">
                    <DocumentSuggestions collectionName={collectionName} />
                </TabsContent>
            </Tabs>
        </div>
    );
}