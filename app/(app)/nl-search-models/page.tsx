'use client';

import NLSearchModels from '@/components/features/search/nl-search-models';
import { VersionGate } from '@/components/shared/version-gate';

export default function NLSearchModelsPage() {
    return (
        <VersionGate
            feature="naturalLanguageSearch"
            featureName="Natural Language Search"
        >
            <NLSearchModels />
        </VersionGate>
    );
}
