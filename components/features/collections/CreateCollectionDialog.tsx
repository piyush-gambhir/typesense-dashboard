'use client';

import { PlusCircle } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';

import CreateCollectionUnified from '@/components/features/collections/CreateCollectionUnified';

export default function CreateCollectionDialog() {
    const [open, setOpen] = useState(false);

    const handleSuccess = () => {
        setOpen(false);
        // Refresh collections list if needed
        window.location.reload();
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create Collection
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Create New Collection</DialogTitle>
                </DialogHeader>
                <CreateCollectionUnified onSuccess={handleSuccess} mode="dialog" />
            </DialogContent>
        </Dialog>
    );
}
