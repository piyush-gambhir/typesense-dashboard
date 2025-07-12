import CreateDocumentPage from '@/components/CreateDocument';

export default function AddDocumentPage({
  params,
}: {
  params: { collectionName: string };
}) {
  const collectionName = params.collectionName;

  return (
    <div className="container mx-auto p-8">
      <CreateDocumentPage collectionName={collectionName} />
    </div>
  );
}
  