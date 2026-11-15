










export interface ParsedVersion {
    major: number;
    minor: number;
    patch: number;
    raw: string;
}





export function parseVersion(versionStr: string): ParsedVersion {
    const cleaned = versionStr.replace(/^v/i, '').trim();
    const parts = cleaned.split('.').map(Number);



    return {
        major: parts[0] ?? 0,
        minor: parts[1] ?? 0,
        patch: parts[2] ?? 0,
        raw: cleaned,
    };
}







export function compareVersions(
    a: ParsedVersion,
    b: ParsedVersion,
): -1 | 0 | 1 {
    if (a.major !== b.major) return a.major < b.major ? -1 : 1;
    if (a.minor !== b.minor) return a.minor < b.minor ? -1 : 1;
    if (a.patch !== b.patch) return a.patch < b.patch ? -1 : 1;
    return 0;
}





export function isVersionAtLeast(
    version: ParsedVersion | string,
    minVersion: ParsedVersion | string,
): boolean {
    const a = typeof version === 'string' ? parseVersion(version) : version;
    const b =
        typeof minVersion === 'string' ? parseVersion(minVersion) : minVersion;
    return compareVersions(a, b) >= 0;
}







export const FEATURE_MIN_VERSIONS: Record<string, string> = {

    collections: '0.25.0',
    documents: '0.25.0',
    search: '0.25.0',
    apiKeys: '0.25.0',
    aliases: '0.25.0',
    clusterOperations: '0.25.0',
    metrics: '0.25.0',


    analyticsRules: '0.25.0',
    searchPresets: '0.25.0',


    stopwords: '26.0',
    conversationalSearch: '26.0',
    stemmingFieldLevel: '26.0',



    synonymsCollectionLevel: '0.25.0',
    overridesCollectionLevel: '0.25.0',


    stemmingDictionaries: '28.0',


    naturalLanguageSearch: '29.0',


    synonymsGlobal: '30.0',
    overridesGlobal: '30.0',
    diversifyResults: '30.0',
};


export type FeatureKey = keyof typeof FEATURE_MIN_VERSIONS;




export function isFeatureAvailable(
    feature: FeatureKey,
    serverVersion: ParsedVersion | string,
): boolean {
    const minVersion = FEATURE_MIN_VERSIONS[feature];
    if (!minVersion) return true;
    return isVersionAtLeast(serverVersion, minVersion);
}




export function getAvailableFeatures(
    serverVersion: ParsedVersion | string,
): Set<string> {
    const available = new Set<string>();
    for (const [feature, minVer] of Object.entries(FEATURE_MIN_VERSIONS)) {
        if (isVersionAtLeast(serverVersion, minVer)) {
            available.add(feature);
        }
    }
    return available;
}




export function formatVersion(version: ParsedVersion | string): string {
    const v = typeof version === 'string' ? parseVersion(version) : version;
    if (v.major === 0) {
        return `v${v.major}.${v.minor}${v.patch ? `.${v.patch}` : ''}`;
    }
    return `v${v.major}.${v.minor}${v.patch ? `.${v.patch}` : ''}`;
}
