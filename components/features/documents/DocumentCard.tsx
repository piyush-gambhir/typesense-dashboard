'use client';

import { Edit, Trash2 } from 'lucide-react';
import Image from 'next/image';
import React, { useState } from 'react';

import { validateURL } from '@/utils/zod/validation';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

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
    const renderContent = () => {
        if (Array.isArray(value)) {
            return value.length > 0 ? (
                <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto">
                    {value.map((item, index) => (
                        <span
                            key={index}
                            className="inline-block px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-md text-xs md:text-sm break-words"
                        >
                            {String(item)}
                        </span>
                    ))}
                </div>
            ) : (
                <span className="text-gray-400 italic">No items</span>
            );
        }

        if (typeof value === 'string') {
            if (value.trim() === '') {
                return <span className="text-gray-400 italic">Empty</span>;
            }
            try {
                if (validateURL(value).valid) {
                    if (isImageUrl(value)) {
                        return (
                            <>
                                <Image
                                    src={value}
                                    alt={field}
                                    width={200}
                                    height={200}
                                    className="mt-2 rounded-md"
                                />
                                <div className="mt-2 break-words">
                                    <Link
                                        href={value}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-500 hover:underline inline-flex"
                                    >
                                        <span className="break-all">
                                            {value}
                                        </span>
                                    </Link>
                                </div>
                            </>
                        );
                    }
                    return (
                        <Link
                            href={value}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:underline inline-flex  break-all"
                        >
                            <span className="mr-1">{value}</span>
                        </Link>
                    );
                }
                return <span dangerouslySetInnerHTML={{ __html: value }} />;
            } catch {
                // If URL validation fails, just render as regular text
                return (
                    <span dangerouslySetInnerHTML={{ __html: String(value) }} />
                );
            }
        }

        if (value === null || value === undefined) {
            return <span className="text-gray-400 italic">Not available</span>;
        }

        return <span>{String(value)}</span>;
    };

    return (
        <div className="mb-4">
            <span className="font-semibold text-sm md:text-base block mb-2">
                {field}
            </span>
            <div className="text-sm md:text-base">{renderContent()}</div>
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

    return (
        <>
            <Card className="w-full flex flex-col justify-between">
                <CardContent className="p-4 md:p-6">
                    <div className="space-y-4">
                        <div className="mb-4">
                            <span className="font-semibold text-sm md:text-base block mb-2">
                                ID
                            </span>
                            <div className="text-sm md:text-base break-all">
                                {String(result.id)}
                            </div>
                        </div>
                        {sortedEntries.map(
                            ([key, value]) =>
                                key !== 'id' && (
                                    <ResultField
                                        key={key}
                                        field={key}
                                        value={value}
                                    />
                                ),
                        )}
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col sm:flex-row justify-end gap-2 pt-4 border-t">
                    <Link
                        href={`/collections/${collectionName}/document/${result.id}`}
                        className="w-full sm:w-auto"
                    >
                        <Button
                            variant="outline"
                            size="sm"
                            className="w-full sm:w-auto"
                        >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                        </Button>
                    </Link>
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setIsDeleteDialogOpen(true)}
                        className="w-full sm:w-auto"
                    >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                    </Button>
                </CardFooter>
            </Card>

            <Dialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            Are you sure you want to delete this document?
                        </DialogTitle>
                        <DialogDescription>
                            This action cannot be undone. This will permanently
                            delete the document and remove its data from our
                            servers.
                        </DialogDescription>
                    </DialogHeader>
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
                        >
                            {isDeleting ? 'Deleting...' : 'Delete'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default DocumentCard;
