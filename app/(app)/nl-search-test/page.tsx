'use client';

import NLSearchTest from '@/components/features/search/nl-search-test';
import { VersionGate } from '@/components/shared/version-gate';

export default function NLSearchTestPage() {
    return (
        <VersionGate
            feature="naturalLanguageSearch"
            featureName="Natural Language Search"
        >
            <NLSearchTest />
        </VersionGate>
    );
}
