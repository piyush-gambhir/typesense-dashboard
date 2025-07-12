'use client';

import DocumentForm from '@/components/features/documents/DocumentForm';

export default function EditDocumentPage({
    collectionName,
    documentId,
}: Readonly<{
    collectionName: string;
    documentId: string;
}>) {
    return (
        <div className="container mx-auto p-4 max-w-4xl">
            <DocumentForm 
                collectionName={collectionName} 
                documentId={documentId}
                mode="edit" 
            />
        </div>
    );
}