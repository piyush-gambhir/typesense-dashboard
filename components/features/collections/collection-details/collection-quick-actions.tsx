'use client';

import { Download, Import, PlusCircle, Settings, Upload } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

import DeleteCollectionDialog from '@/components/features/collections/delete-collection-dialog';

interface CollectionQuickActionsProps {
    collectionName: string;
    isJsonMode: boolean;
    onAddField: () => void;
    onImportDocuments: () => void;
    onExportDocuments: () => void;
    onUpdateSchema: () => void;
}

export default function CollectionQuickActions({
    collectionName,
    isJsonMode,
    onAddField,
    onImportDocuments,
    onExportDocuments,
    onUpdateSchema
}: CollectionQuickActionsProps) {
    return (
        <Card className="border border-border/50">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Quick Actions
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Button
                        onClick={onAddField}
                        disabled={isJsonMode}
                        variant="outline"
                        className="justify-start gap-2 h-auto p-4"
                    >
                        <div className="p-2 bg-blue-500/10 rounded-lg">
                            <PlusCircle className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="text-left">
                            <div className="font-medium">Add Field</div>
                            <div className="text-xs text-muted-foreground">Extend schema</div>
                        </div>
                    </Button>
                    
                    <Button
                        onClick={onImportDocuments}
                        variant="outline"
                        className="justify-start gap-2 h-auto p-4"
                    >
                        <div className="p-2 bg-emerald-500/10 rounded-lg">
                            <Import className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div className="text-left">
                            <div className="font-medium">Import Documents</div>
                            <div className="text-xs text-muted-foreground">Bulk upload data</div>
                        </div>
                    </Button>
                    
                    <Button
                        onClick={onExportDocuments}
                        variant="outline"
                        className="justify-start gap-2 h-auto p-4"
                    >
                        <div className="p-2 bg-amber-500/10 rounded-lg">
                            <Download className="w-4 h-4 text-amber-600" />
                        </div>
                        <div className="text-left">
                            <div className="font-medium">Export Documents</div>
                            <div className="text-xs text-muted-foreground">Download data</div>
                        </div>
                    </Button>
                </div>
                
                <Separator className="my-6" />
                
                <div className="flex items-center justify-between">
                    <div className="flex gap-3">
                        <Button
                            onClick={onUpdateSchema}
                            className="bg-gradient-to-r from-primary to-primary/90 shadow-lg"
                        >
                            <Settings className="w-4 h-4 mr-2" />
                            Update Schema
                        </Button>
                    </div>
                    <DeleteCollectionDialog collectionName={collectionName} />
                </div>
            </CardContent>
        </Card>
    );
}