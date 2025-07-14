import CurationsContainer from './curations/curations-container';

interface CollectionCurationsProps {
    collectionName: string;
}

export default function CollectionCurations({ collectionName }: CollectionCurationsProps) {
    return <CurationsContainer collectionName={collectionName} />;
}