'use client';

import { 
    Calendar,
    Edit, 
    ExternalLink,
    FileText,
    Hash,
    Image as ImageIcon,
    Link as LinkIcon,
    Trash2 
} from 'lucide-react';
import Image from 'next/image';
import React, { useState } from 'react';

import { validateURL } from '@/utils/zod/validation';
import { cn } from '@/lib/utils';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';

import Link from '@/components/link';

interface DocumentCardProps {
    key: string;
    result: Record<string, unknown>;
    collectionName: string;
    onEdit?: (id: string) => void;
    onDelete: (id: string) => void;
}

const isImageUrl = (url: string): boolean => {
    return /\.(jpg|jpeg|png|webp|avif|gif|svg)$/i.test(url);
};

interface ResultFieldProps {
    field: string;
    value: unknown;
}

const ResultField: React.FC<ResultFieldProps> = ({ field, value }) => {
    const getFieldIcon = (fieldName: string, value: unknown) => {
        if (fieldName.toLowerCase().includes('date') || fieldName.toLowerCase().includes('time')) {
            return <Calendar className="h-3 w-3 text-amber-500" />;
        }
        if (fieldName.toLowerCase() === 'id') {
            return <Hash className="h-3 w-3 text-blue-500" />;
        }
        if (Array.isArray(value)) {
            return <FileText className="h-3 w-3 text-purple-500" />;
        }
        if (typeof value === 'string' && validateURL(String(value)).valid) {
            return isImageUrl(String(value)) ? 
                <ImageIcon className="h-3 w-3 text-emerald-500" /> : 
                <LinkIcon className="h-3 w-3 text-blue-500" />;
        }
        return <FileText className="h-3 w-3 text-muted-foreground" />;
    };

    const renderContent = () => {
        if (Array.isArray(value)) {
            return value.length > 0 ? (
                <div className="space-y-2">
                    <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto">
                        {value.map((item, index) => (
                            <Badge
                                key={index}
                                variant="secondary"
                                className="text-xs font-mono"
                            >
                                {String(item)}
                            </Badge>
                        ))}
                    </div>
                    <div className="text-xs text-muted-foreground">
                        {value.length} items
                    </div>
                </div>
            ) : (
                <div className="flex items-center gap-2 text-muted-foreground">
                    <span className="text-sm">No items</span>
                </div>
            );
        }

        if (typeof value === 'string') {
            if (value.trim() === '') {
                return (
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <span className="text-sm italic">Empty</span>
                    </div>
                );
            }
            try {
                if (validateURL(value).valid) {
                    if (isImageUrl(value)) {
                        return (
                            <div className="space-y-3">
                                <div className="relative overflow-hidden rounded-lg border bg-muted/20">
                                    <Image
                                        src={value}
                                        alt={field}
                                        width={200}
                                        height={200}
                                        className="object-cover"
                                    />
                                </div>
                                <Link
                                    href={value}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm"
                                >
                                    <ExternalLink className="h-3 w-3" />
                                    <span className="break-all font-mono text-xs">
                                        {value.length > 50 ? `${value.substring(0, 50)}...` : value}
                                    </span>
                                </Link>
                            </div>
                        );
                    }
                    return (
                        <Link
                            href={value}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm"
                        >
                            <ExternalLink className="h-3 w-3" />
                            <span className="break-all font-mono">
                                {value.length > 80 ? `${value.substring(0, 80)}...` : value}
                            </span>
                        </Link>
                    );
                }
                return (
                    <div className="text-sm break-words font-mono bg-muted/30 rounded-md p-2">
                        {value.length > 200 ? `${value.substring(0, 200)}...` : value}
                    </div>
                );
            } catch {
                return (
                    <div className="text-sm break-words font-mono bg-muted/30 rounded-md p-2">
                        {String(value).length > 200 ? `${String(value).substring(0, 200)}...` : String(value)}
                    </div>
                );
            }
        }

        if (value === null || value === undefined) {
            return (
                <div className="flex items-center gap-2 text-muted-foreground">
                    <span className="text-sm italic">Not available</span>
                </div>
            );
        }

        return (
            <div className="text-sm font-mono bg-muted/30 rounded-md p-2">
                {String(value)}
            </div>
        );
    };

    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2">
                {getFieldIcon(field, value)}
                <span className="text-sm font-medium text-muted-foreground">
                    {field}
                </span>
            </div>
            <div className="ml-5">{renderContent()}</div>
        </div>
    );
};

const DocumentCard = ({
    result,
    collectionName,
    onDelete,
}: Readonly<DocumentCardProps>) => {
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const sortedEntries = Object.entries(result).sort(([keyA], [keyB]) => {
        if (keyA === 'id') return -1;
        if (keyB === 'id') return 1;
        if (
            keyA === 'created_at' ||
            keyA === 'createdAt' ||
            keyA === 'updated_at' ||
            keyA === 'updatedAt'
        )
            return 1;
        if (
            keyB === 'created_at' ||
            keyB === 'createdAt' ||
            keyB === 'updated_at' ||
            keyB === 'updatedAt'
        )
            return -1;

        return 0;
    });

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await onDelete(String(result.id));
        } finally {
            setIsDeleting(false);
            setIsDeleteDialogOpen(false);
        }
    };

    const fieldCount = Object.keys(result).length;
    const documentId = String(result.id);

    return (
        <>
            <Card className="border border-border/50 bg-gradient-to-br from-card via-card to-card/95 shadow-lg backdrop-blur-sm">
                <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                        <div className="space-y-1">
                            <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                <div className="p-2 bg-blue-500/10 rounded-lg">
                                    <FileText className="h-4 w-4 text-blue-600" />
                                </div>
                                Document
                            </CardTitle>
                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className="font-mono text-xs">
                                    {documentId.length > 20 ? `${documentId.substring(0, 20)}...` : documentId}
                                </Badge>
                                <Badge variant="secondary" className="text-xs">
                                    {fieldCount} fields
                                </Badge>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                            <Link href={`/collections/${collectionName}/document/${result.id}`}>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <Edit className="h-4 w-4" />
                                </Button>
                            </Link>
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => setIsDeleteDialogOpen(true)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                        <ResultField field="id" value={result.id} />
                        {sortedEntries.map(
                            ([key, value]) =>
                                key !== 'id' && (
                                    <div key={key}>
                                        <ResultField field={key} value={value} />
                                        <Separator className="mt-4" />
                                    </div>
                                ),
                        )}
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between pt-2">
                        <div className="flex gap-2">
                            <Link href={`/collections/${collectionName}/document/${result.id}`} className="flex-1">
                                <Button variant="outline" size="sm" className="gap-2">
                                    <Edit className="h-4 w-4" />
                                    Edit Document
                                </Button>
                            </Link>
                        </div>
                        <Button 
                            variant="outline" 
                            size="sm" 
                            className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20"
                            onClick={() => setIsDeleteDialogOpen(true)}
                        >
                            <Trash2 className="h-4 w-4" />
                            Delete
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Dialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
            >
                <DialogContent className="border-destructive/20">
                    <DialogHeader>
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-destructive/10 rounded-full">
                                <Trash2 className="h-6 w-6 text-destructive" />
                            </div>
                            <div>
                                <DialogTitle className="text-xl">
                                    Delete Document
                                </DialogTitle>
                                <DialogDescription className="mt-1">
                                    Are you sure you want to delete this document?
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>
                    
                    <div className="my-4 p-4 bg-destructive/5 border border-destructive/20 rounded-lg">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <Hash className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-medium">Document ID:</span>
                                <Badge variant="outline" className="font-mono text-xs">
                                    {documentId}
                                </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                This action cannot be undone. The document and all its data will be permanently removed.
                            </p>
                        </div>
                    </div>
                    
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsDeleteDialogOpen(false)}
                            disabled={isDeleting}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="gap-2"
                        >
                            {isDeleting ? (
                                <>
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                    Deleting...
                                </>
                            ) : (
                                <>
                                    <Trash2 className="h-4 w-4" />
                                    Delete Document
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default DocumentCard;
