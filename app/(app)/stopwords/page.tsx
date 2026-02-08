'use client';

import Stopwords from '@/components/features/analytics/stopwords';
import { VersionGate } from '@/components/shared/version-gate';

export default function StopwordsPage() {
    return (
        <VersionGate feature="stopwords" featureName="Stopwords">
            <Stopwords />
        </VersionGate>
    );
}
