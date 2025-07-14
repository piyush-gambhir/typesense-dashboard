import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

interface DeleteDocumentDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onDelete: () => void;
}

const DeleteDocumentDialog: React.FC<DeleteDocumentDialogProps> = ({
    isOpen,
    onClose,
    onDelete,
}) => {
    const [isDeleting] = useState(false);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
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
                        onClick={onClose}
                        disabled={isDeleting}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={onDelete}
                        disabled={isDeleting}
                    >
                        {isDeleting ? 'Deleting...' : 'Delete'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default DeleteDocumentDialog;
