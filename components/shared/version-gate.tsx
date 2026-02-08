'use client';

import { ArrowUpCircle } from 'lucide-react';
import React from 'react';

import { FEATURE_MIN_VERSIONS, type FeatureKey } from '@/lib/typesense/version';
import { useTypesenseVersion } from '@/providers/typesense-version-provider';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface VersionGateProps {
    /** The feature key to check against the connected server version */
    feature: FeatureKey;
    /** Human-readable feature name for the error message */
    featureName: string;
    /** Content to render when the feature is available */
    children: React.ReactNode;
}

/**
 * Conditionally renders children only if the connected Typesense server
 * supports the given feature. Otherwise shows a helpful message indicating
 * the minimum version required.
 *
 * When the server version is unknown (detection failed), children are
 * rendered anyway (permissive fallback) — the API call itself will surface
 * any actual incompatibility.
 */
export function VersionGate({
    feature,
    featureName,
    children,
}: VersionGateProps) {
    const { hasFeature, label, detected } = useTypesenseVersion();

    // If version was not detected or the feature is available, render children
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
