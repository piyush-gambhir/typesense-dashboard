'use client';

import { Edit } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

import DocumentForm from './document-form';

interface EditDocumentDialogProps {
    documentId: string;
    collectionName: string;
    onSuccess?: () => void;
    triggerClassName?: string;
}

export default function EditDocumentDialog({
    documentId,
    collectionName,
    onSuccess,
    triggerClassName = "h-8 w-8 p-0",
}: EditDocumentDialogProps) {
    const [isOpen, setIsOpen] = useState(false);

    const handleSuccess = () => {
        setIsOpen(false);
        if (onSuccess) {
            onSuccess();
        }
    };

    return (
        <>
            <Button
                variant="ghost"
                size="sm"
                className={triggerClassName}
                onClick={() => setIsOpen(true)}
            >
                <Edit className="h-4 w-4" />
            </Button>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit Document</DialogTitle>
                    </DialogHeader>
                    <DocumentForm
                        collectionName={collectionName}
                        documentId={documentId}
                        mode="edit"
                        onSuccess={handleSuccess}
                    />
                </DialogContent>
            </Dialog>
        </>
    );
}