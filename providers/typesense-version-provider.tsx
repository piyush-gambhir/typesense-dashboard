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

    rawVersion: string | null;

    parsed: ParsedVersion | null;

    label: string;

    hasFeature: (feature: FeatureKey) => boolean;

    detected: boolean;
}

const TypesenseVersionContext = createContext<TypesenseVersionContextValue>({
    rawVersion: null,
    parsed: null,
    label: 'Unknown',
    hasFeature: () => true,
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
                hasFeature: () => true,
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










export function useTypesenseVersion() {
    return useContext(TypesenseVersionContext);
}
