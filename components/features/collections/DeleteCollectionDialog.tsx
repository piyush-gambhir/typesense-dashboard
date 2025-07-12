'use client';

import { Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { deleteCollection } from '@/lib/typesense/collections';

import { toast } from '@/hooks/useToast';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';

export default function DeleteCollectionDialog({
    collectionName,
}: {
    collectionName: string;
}) {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);

    const handleDelete = async () => {
        try {
            await deleteCollection(collectionName);
            toast({
                title: 'Collection Deleted',
                description: `Collection '${collectionName}' has been successfully deleted.`,
            });
            router.push('/collections');
        } catch {
            toast({
                title: 'Error',
                description: `Failed to delete collection '${collectionName}'.`,
                variant: 'destructive',
            });
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="destructive">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Collection
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Are you absolutely sure?</DialogTitle>
                    <DialogDescription>
                        This action cannot be undone. This will permanently
                        delete the
                        <span className="font-bold text-red-500">
                            {' '}
                            {collectionName}{' '}
                        </span>
                        collection and all its documents from Typesense.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsOpen(false)}>
                        Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleDelete}>
                        Delete
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
