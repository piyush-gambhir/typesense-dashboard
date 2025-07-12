'use client';

import DocumentForm from '@/components/features/documents/DocumentForm';

export default function CreateDocumentPage({
    collectionName,
}: Readonly<{
    collectionName: string;
}>) {
    return (
        <div className="container mx-auto p-4 max-w-4xl">
            <DocumentForm 
                collectionName={collectionName} 
                mode="create" 
            />
        </div>
    );
}