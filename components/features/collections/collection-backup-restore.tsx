'use client';

import { AlertTriangle, Download, RotateCcw, Save, Upload } from 'lucide-react';
import { useState } from 'react';

import {
    backupCollection,
    restoreCollection,
} from '@/lib/typesense/collections';

import { toast } from '@/hooks/use-toast';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';

interface CollectionBackupRestoreProps {
    collectionName: string;
}

export default function CollectionBackupRestore({
    collectionName,
}: CollectionBackupRestoreProps) {
    const [isBackingUp, setIsBackingUp] = useState(false);
    const [isRestoring, setIsRestoring] = useState(false);
    const [backupProgress, setBackupProgress] = useState(0);
    const [restoreProgress, setRestoreProgress] = useState(0);
    const [backupData, setBackupData] = useState<any>(null);

    const handleBackup = async () => {
        setIsBackingUp(true);
        setBackupProgress(0);

        try {
            // Simulate progress
            const progressInterval = setInterval(() => {
                setBackupProgress((prev) => {
                    if (prev >= 90) {
                        clearInterval(progressInterval);
                        return 90;
                    }
                    return prev + 10;
                });
            }, 200);

            const result = await backupCollection(collectionName);

            clearInterval(progressInterval);
            setBackupProgress(100);

            if (result.success && result.data) {
                setBackupData(result.data);
                toast({
                    title: 'Backup Created',
                    description: `Successfully backed up collection '${collectionName}' with ${result.data.total_documents} documents`,
                });
            } else {
                throw new Error(result.error || 'Backup failed');
            }
        } catch (error) {
            toast({
                title: 'Backup Failed',
                description:
                    error instanceof Error
                        ? error.message
                        : 'Unknown error occurred',
                variant: 'destructive',
            });
        } finally {
            setIsBackingUp(false);
            setTimeout(() => setBackupProgress(0), 1000);
        }
    };

    const handleDownloadBackup = () => {
        if (!backupData) return;

        const blob = new Blob([JSON.stringify(backupData, null, 2)], {
            type: 'application/json',
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${collectionName}_backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toast({
            title: 'Backup Downloaded',
            description: 'Backup file has been downloaded to your device',
        });
    };

    const handleRestore = async (backupFile: File) => {
        setIsRestoring(true);
        setRestoreProgress(0);

        try {
            const fileContent = await backupFile.text();
            const backup = JSON.parse(fileContent);

            // Validate backup structure
            if (!backup.collection_schema || !backup.documents) {
                throw new Error('Invalid backup file format');
            }

            // Simulate progress
            const progressInterval = setInterval(() => {
                setRestoreProgress((prev) => {
                    if (prev >= 90) {
                        clearInterval(progressInterval);
                        return 90;
                    }
                    return prev + 10;
                });
            }, 200);

            const result = await restoreCollection(backup);

            clearInterval(progressInterval);
            setRestoreProgress(100);

            if (result.success) {
                toast({
                    title: 'Collection Restored',
                    description: `Successfully restored collection '${backup.collection_schema.name}'`,
                });
            } else {
                throw new Error(result.error || 'Restore failed');
            }
        } catch (error) {
            toast({
                title: 'Restore Failed',
                description:
                    error instanceof Error
                        ? error.message
                        : 'Unknown error occurred',
                variant: 'destructive',
            });
        } finally {
            setIsRestoring(false);
            setTimeout(() => setRestoreProgress(0), 1000);
        }
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            handleRestore(file);
        }
    };

    return (
        <div className="space-y-6">
            {/* Backup Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Save className="h-5 w-5" />
                        <span>Backup Collection</span>
                    </CardTitle>
                    <CardDescription>
                        Create a complete backup of your collection including
                        schema and all documents
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center space-x-2">
                        <Button
                            onClick={handleBackup}
                            disabled={isBackingUp}
                            variant="outline"
                        >
                            <Download className="h-4 w-4 mr-2" />
                            {isBackingUp
                                ? 'Creating Backup...'
                                : 'Create Backup'}
                        </Button>

                        {backupData && (
                            <Button
                                onClick={handleDownloadBackup}
                                variant="default"
                            >
                                <Download className="h-4 w-4 mr-2" />
                                Download Backup
                            </Button>
                        )}
                    </div>

                    {isBackingUp && (
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Creating backup...</span>
                                <span>{backupProgress}%</span>
                            </div>
                            <Progress
                                value={backupProgress}
                                className="w-full"
                            />
                        </div>
                    )}

                    {backupData && (
                        <Alert>
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                                Backup created successfully! Contains{' '}
                                {backupData.total_documents} documents. Click
                                "Download Backup" to save the file to your
                                device.
                            </AlertDescription>
                        </Alert>
                    )}
                </CardContent>
            </Card>

            <Separator />

            {/* Restore Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <RotateCcw className="h-5 w-5" />
                        <span>Restore Collection</span>
                    </CardTitle>
                    <CardDescription>
                        Restore a collection from a backup file
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="backup-file">Select Backup File</Label>
                        <Input
                            id="backup-file"
                            type="file"
                            accept=".json"
                            onChange={handleFileUpload}
                            disabled={isRestoring}
                        />
                        <p className="text-sm text-muted-foreground">
                            Upload a backup file (.json) to restore a collection
                        </p>
                    </div>

                    {isRestoring && (
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Restoring collection...</span>
                                <span>{restoreProgress}%</span>
                            </div>
                            <Progress
                                value={restoreProgress}
                                className="w-full"
                            />
                        </div>
                    )}

                    <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                            <strong>Warning:</strong> Restoring a collection
                            will create a new collection with the same name. If
                            a collection with the same name already exists, the
                            restore operation will fail. Make sure to delete any
                            existing collection with the same name before
                            restoring.
                        </AlertDescription>
                    </Alert>
                </CardContent>
            </Card>

            {/* Backup Information */}
            {backupData && (
                <Card>
                    <CardHeader>
                        <CardTitle>Backup Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-muted-foreground">
                                    Collection Name:
                                </span>
                                <span className="ml-2 font-medium">
                                    {backupData.collection_schema.name}
                                </span>
                            </div>
                            <div>
                                <span className="text-muted-foreground">
                                    Total Documents:
                                </span>
                                <span className="ml-2 font-medium">
                                    {backupData.total_documents}
                                </span>
                            </div>
                            <div>
                                <span className="text-muted-foreground">
                                    Fields:
                                </span>
                                <span className="ml-2 font-medium">
                                    {backupData.collection_schema.fields.length}
                                </span>
                            </div>
                            <div>
                                <span className="text-muted-foreground">
                                    Backup Date:
                                </span>
                                <span className="ml-2 font-medium">
                                    {new Date(
                                        backupData.backup_timestamp,
                                    ).toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
