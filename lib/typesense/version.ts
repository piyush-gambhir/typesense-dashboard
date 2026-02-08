/**
 * Typesense version detection, parsing, comparison, and feature gating.
 *
 * The dashboard detects the connected Typesense server version via the
 * `/debug` endpoint (which returns `{ state, version }`) and uses it to
 * conditionally enable/disable UI features that are only available in
 * certain server versions.
 */

// ─── Version Parsing ─────────────────────────────────────────────────────────

export interface ParsedVersion {
    major: number;
    minor: number;
    patch: number;
    raw: string;
}

/**
 * Parse a Typesense version string like "0.25.2", "26.0", "27.1", "30.0".
 * Handles both the old `0.x.y` scheme and the new `x.y` scheme.
 */
export function parseVersion(versionStr: string): ParsedVersion {
    const cleaned = versionStr.replace(/^v/i, '').trim();
    const parts = cleaned.split('.').map(Number);

    // Old scheme: 0.25.2 → major=0, minor=25, patch=2
    // New scheme: 26.0   → major=26, minor=0, patch=0
    return {
        major: parts[0] ?? 0,
        minor: parts[1] ?? 0,
        patch: parts[2] ?? 0,
        raw: cleaned,
    };
}

/**
 * Compare two parsed versions. Returns:
 *  -1 if a < b
 *   0 if a == b
 *   1 if a > b
 */
export function compareVersions(
    a: ParsedVersion,
    b: ParsedVersion,
): -1 | 0 | 1 {
    if (a.major !== b.major) return a.major < b.major ? -1 : 1;
    if (a.minor !== b.minor) return a.minor < b.minor ? -1 : 1;
    if (a.patch !== b.patch) return a.patch < b.patch ? -1 : 1;
    return 0;
}

/**
 * Check if `version` is greater than or equal to `minVersion`.
 * Both can be either ParsedVersion objects or version strings.
 */
export function isVersionAtLeast(
    version: ParsedVersion | string,
    minVersion: ParsedVersion | string,
): boolean {
    const a = typeof version === 'string' ? parseVersion(version) : version;
    const b =
        typeof minVersion === 'string' ? parseVersion(minVersion) : minVersion;
    return compareVersions(a, b) >= 0;
}

// ─── Feature Map ─────────────────────────────────────────────────────────────

/**
 * Every dashboard feature that is version-gated.
 * Maps a feature key to the minimum Typesense server version required.
 */
export const FEATURE_MIN_VERSIONS: Record<string, string> = {
    // Core – available in all supported versions (v0.25+)
    collections: '0.25.0',
    documents: '0.25.0',
    search: '0.25.0',
    apiKeys: '0.25.0',
    aliases: '0.25.0',
    clusterOperations: '0.25.0',
    metrics: '0.25.0',

    // v0.25 features
    analyticsRules: '0.25.0',
    searchPresets: '0.25.0',

    // v26 features
    stopwords: '26.0',
    conversationalSearch: '26.0',
    stemmingFieldLevel: '26.0', // stem: true on fields

    // Collection-level synonyms & overrides (available in all versions,
    // but deprecated in v30 in favour of global resources)
    synonymsCollectionLevel: '0.25.0',
    overridesCollectionLevel: '0.25.0',

    // v28 features
    stemmingDictionaries: '28.0',

    // v29 features
    naturalLanguageSearch: '29.0',

    // v30 features  – synonyms & overrides became global (top-level) resources
    synonymsGlobal: '30.0',
    overridesGlobal: '30.0',
    diversifyResults: '30.0',
};

/** Convenience type for feature keys */
export type FeatureKey = keyof typeof FEATURE_MIN_VERSIONS;

/**
 * Check whether a given feature is available on the connected server.
 */
export function isFeatureAvailable(
    feature: FeatureKey,
    serverVersion: ParsedVersion | string,
): boolean {
    const minVersion = FEATURE_MIN_VERSIONS[feature];
    if (!minVersion) return true; // unknown feature – assume available
    return isVersionAtLeast(serverVersion, minVersion);
}

/**
 * Given a server version, return the set of feature keys that are available.
 */
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

/**
 * Return a human-readable version label, e.g. "v27.1" or "v0.25.2".
 */
export function formatVersion(version: ParsedVersion | string): string {
    const v = typeof version === 'string' ? parseVersion(version) : version;
    if (v.major === 0) {
        return `v${v.major}.${v.minor}${v.patch ? `.${v.patch}` : ''}`;
    }
    return `v${v.major}.${v.minor}${v.patch ? `.${v.patch}` : ''}`;
}
