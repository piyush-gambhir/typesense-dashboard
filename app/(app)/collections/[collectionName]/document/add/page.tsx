import CreateDocumentPage from '@/components/features/documents/CreateDocument';

export default async function AddDocumentPage({
  params,
}: {
  params: Promise<{ collectionName: string }>;
}) {
  const { collectionName } = await params;

  return (
    <div className="container mx-auto p-8">
      <CreateDocumentPage collectionName={collectionName} />
    </div>
  );
}
  