'use client';

import Stemming from '@/components/features/analytics/stemming';
import { VersionGate } from '@/components/shared/version-gate';

export default function StemmingPage() {
    return (
        <VersionGate
            feature="stemmingDictionaries"
            featureName="Stemming Dictionaries"
        >
            <Stemming />
        </VersionGate>
    );
}
