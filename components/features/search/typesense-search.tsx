import SearchContainer from './search-container';

interface TypesenseSearchProps {
    collectionName: string;
}

export default function TypesenseSearch({
    collectionName,
}: Readonly<TypesenseSearchProps>) {
    return <SearchContainer collectionName={collectionName} />;
}