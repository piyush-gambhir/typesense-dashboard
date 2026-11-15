'use client';

import { ArrowUpCircle } from 'lucide-react';
import React from 'react';

import { FEATURE_MIN_VERSIONS, type FeatureKey } from '@/lib/typesense/version';
import { useTypesenseVersion } from '@/providers/typesense-version-provider';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface VersionGateProps {

    feature: FeatureKey;

    featureName: string;

    children: React.ReactNode;
}










export function VersionGate({
    feature,
    featureName,
    children,
}: VersionGateProps) {
    const { hasFeature, label, detected } = useTypesenseVersion();


    if (!detected || hasFeature(feature)) {
        return <>{children}</>;
    }

    const minVersion = FEATURE_MIN_VERSIONS[feature] ?? 'unknown';

    return (
        <div className="flex items-center justify-center py-20 px-4">
            <Alert
                variant="default"
                className="max-w-lg border-amber-500/50 bg-amber-500/5"
            >
                <ArrowUpCircle className="h-5 w-5 text-amber-500" />
                <AlertTitle className="text-lg font-semibold">
                    {featureName} Not Available
                </AlertTitle>
                <AlertDescription className="mt-2 space-y-2">
                    <p>
                        <strong>{featureName}</strong> requires Typesense{' '}
                        <strong>v{minVersion}</strong> or later.
                    </p>
                    <p className="text-muted-foreground">
                        Your connected server is running{' '}
                        <strong>{label}</strong>. Upgrade your Typesense server
                        to access this feature.
                    </p>
                </AlertDescription>
            </Alert>
        </div>
    );
}
