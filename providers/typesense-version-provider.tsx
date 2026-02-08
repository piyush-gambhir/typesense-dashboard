'use client';

import React, { createContext, useContext, useMemo } from 'react';

import {
    formatVersion,
    isFeatureAvailable,
    parseVersion,
    type FeatureKey,
    type ParsedVersion,
} from '@/lib/typesense/version';

interface TypesenseVersionContextValue {
    /** Raw version string from the server, e.g. "27.1" */
    rawVersion: string | null;
    /** Parsed version object */
    parsed: ParsedVersion | null;
    /** Human-readable label, e.g. "v27.1" */
    label: string;
    /** Check if a feature is supported on the connected server */
    hasFeature: (feature: FeatureKey) => boolean;
    /** Whether version detection succeeded */
    detected: boolean;
}

const TypesenseVersionContext = createContext<TypesenseVersionContextValue>({
    rawVersion: null,
    parsed: null,
    label: 'Unknown',
    hasFeature: () => true, // default: allow everything if version unknown
    detected: false,
});

export function TypesenseVersionProvider({
    serverVersion,
    children,
}: {
    serverVersion: string | null | undefined;
    children: React.ReactNode;
}) {
    const value = useMemo<TypesenseVersionContextValue>(() => {
        if (!serverVersion) {
            return {
                rawVersion: null,
                parsed: null,
                label: 'Unknown',
                hasFeature: () => true, // be permissive when version is unknown
                detected: false,
            };
        }

        const parsed = parseVersion(serverVersion);
        return {
            rawVersion: serverVersion,
            parsed,
            label: formatVersion(parsed),
            hasFeature: (feature: FeatureKey) =>
                isFeatureAvailable(feature, parsed),
            detected: true,
        };
    }, [serverVersion]);

    return (
        <TypesenseVersionContext.Provider value={value}>
            {children}
        </TypesenseVersionContext.Provider>
    );
}

/**
 * Access the connected Typesense server version and feature flags.
 *
 * @example
 * ```tsx
 * const { hasFeature, label } = useTypesenseVersion();
 * if (hasFeature('stemmingDictionaries')) { ... }
 * ```
 */
export function useTypesenseVersion() {
    return useContext(TypesenseVersionContext);
}
