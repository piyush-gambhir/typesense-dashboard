import { describe, expect, it } from 'vitest';

import {
    compareVersions,
    FEATURE_MIN_VERSIONS,
    formatVersion,
    getAvailableFeatures,
    isFeatureAvailable,
    isVersionAtLeast,
    parseVersion,
} from '@/lib/typesense/version';

// ─── parseVersion ────────────────────────────────────────────────────────────

describe('parseVersion', () => {
    it('parses old 0.x.y format', () => {
        const v = parseVersion('0.25.2');
        expect(v).toEqual({ major: 0, minor: 25, patch: 2, raw: '0.25.2' });
    });

    it('parses new x.y format', () => {
        const v = parseVersion('26.0');
        expect(v).toEqual({ major: 26, minor: 0, patch: 0, raw: '26.0' });
    });

    it('parses x.y.z format', () => {
        const v = parseVersion('27.1.3');
        expect(v).toEqual({ major: 27, minor: 1, patch: 3, raw: '27.1.3' });
    });

    it('strips leading v', () => {
        const v = parseVersion('v28.0');
        expect(v).toEqual({ major: 28, minor: 0, patch: 0, raw: '28.0' });
    });

    it('handles whitespace', () => {
        const v = parseVersion('  30.1  ');
        expect(v).toEqual({ major: 30, minor: 1, patch: 0, raw: '30.1' });
    });

    it('handles single number', () => {
        const v = parseVersion('26');
        expect(v).toEqual({ major: 26, minor: 0, patch: 0, raw: '26' });
    });
});

// ─── compareVersions ─────────────────────────────────────────────────────────

describe('compareVersions', () => {
    it('equal versions return 0', () => {
        expect(
            compareVersions(parseVersion('26.0'), parseVersion('26.0')),
        ).toBe(0);
    });

    it('older major < newer major', () => {
        expect(
            compareVersions(parseVersion('0.25.0'), parseVersion('26.0')),
        ).toBe(-1);
    });

    it('newer major > older major', () => {
        expect(
            compareVersions(parseVersion('26.0'), parseVersion('0.25.0')),
        ).toBe(1);
    });

    it('same major, older minor < newer minor', () => {
        expect(
            compareVersions(parseVersion('26.0'), parseVersion('26.1')),
        ).toBe(-1);
    });

    it('same major+minor, older patch < newer patch', () => {
        expect(
            compareVersions(parseVersion('0.25.1'), parseVersion('0.25.2')),
        ).toBe(-1);
    });

    it('0.25 < 26.0 (old scheme to new scheme transition)', () => {
        expect(
            compareVersions(parseVersion('0.25.2'), parseVersion('26.0')),
        ).toBe(-1);
    });

    it('30.0 > 29.0', () => {
        expect(
            compareVersions(parseVersion('30.0'), parseVersion('29.0')),
        ).toBe(1);
    });
});

// ─── isVersionAtLeast ────────────────────────────────────────────────────────

describe('isVersionAtLeast', () => {
    it('returns true when version equals minimum', () => {
        expect(isVersionAtLeast('26.0', '26.0')).toBe(true);
    });

    it('returns true when version is above minimum', () => {
        expect(isVersionAtLeast('27.0', '26.0')).toBe(true);
    });

    it('returns false when version is below minimum', () => {
        expect(isVersionAtLeast('0.25.2', '26.0')).toBe(false);
    });

    it('works with ParsedVersion objects', () => {
        expect(
            isVersionAtLeast(parseVersion('30.0'), parseVersion('29.0')),
        ).toBe(true);
    });

    it('works with mixed inputs', () => {
        expect(isVersionAtLeast('28.0', parseVersion('26.0'))).toBe(true);
    });
});

// ─── isFeatureAvailable ──────────────────────────────────────────────────────

describe('isFeatureAvailable', () => {
    it('core features available on v0.25', () => {
        expect(isFeatureAvailable('collections', '0.25.0')).toBe(true);
        expect(isFeatureAvailable('documents', '0.25.0')).toBe(true);
        expect(isFeatureAvailable('search', '0.25.0')).toBe(true);
        expect(isFeatureAvailable('apiKeys', '0.25.0')).toBe(true);
        expect(isFeatureAvailable('aliases', '0.25.0')).toBe(true);
    });

    it('stopwords requires v26+', () => {
        expect(isFeatureAvailable('stopwords', '0.25.2')).toBe(false);
        expect(isFeatureAvailable('stopwords', '26.0')).toBe(true);
        expect(isFeatureAvailable('stopwords', '27.0')).toBe(true);
    });

    it('conversational search requires v26+', () => {
        expect(isFeatureAvailable('conversationalSearch', '0.25.0')).toBe(
            false,
        );
        expect(isFeatureAvailable('conversationalSearch', '26.0')).toBe(true);
    });

    it('stemming dictionaries require v28+', () => {
        expect(isFeatureAvailable('stemmingDictionaries', '26.0')).toBe(false);
        expect(isFeatureAvailable('stemmingDictionaries', '27.0')).toBe(false);
        expect(isFeatureAvailable('stemmingDictionaries', '28.0')).toBe(true);
        expect(isFeatureAvailable('stemmingDictionaries', '30.0')).toBe(true);
    });

    it('natural language search requires v29+', () => {
        expect(isFeatureAvailable('naturalLanguageSearch', '28.0')).toBe(false);
        expect(isFeatureAvailable('naturalLanguageSearch', '29.0')).toBe(true);
        expect(isFeatureAvailable('naturalLanguageSearch', '30.0')).toBe(true);
    });

    it('global synonyms/overrides require v30+', () => {
        expect(isFeatureAvailable('synonymsGlobal', '29.0')).toBe(false);
        expect(isFeatureAvailable('synonymsGlobal', '30.0')).toBe(true);
        expect(isFeatureAvailable('overridesGlobal', '29.0')).toBe(false);
        expect(isFeatureAvailable('overridesGlobal', '30.0')).toBe(true);
    });

    it('unknown feature keys return true (permissive)', () => {
        expect(isFeatureAvailable('nonExistentFeature' as any, '0.25.0')).toBe(
            true,
        );
    });
});

// ─── getAvailableFeatures ────────────────────────────────────────────────────

describe('getAvailableFeatures', () => {
    it('v0.25 gets core features only', () => {
        const features = getAvailableFeatures('0.25.0');
        expect(features.has('collections')).toBe(true);
        expect(features.has('analyticsRules')).toBe(true);
        expect(features.has('aliases')).toBe(true);
        expect(features.has('stopwords')).toBe(false);
        expect(features.has('stemmingDictionaries')).toBe(false);
        expect(features.has('naturalLanguageSearch')).toBe(false);
    });

    it('v26 adds stopwords and conversational search', () => {
        const features = getAvailableFeatures('26.0');
        expect(features.has('stopwords')).toBe(true);
        expect(features.has('conversationalSearch')).toBe(true);
        expect(features.has('stemmingFieldLevel')).toBe(true);
        expect(features.has('stemmingDictionaries')).toBe(false);
    });

    it('v28 adds stemming dictionaries', () => {
        const features = getAvailableFeatures('28.0');
        expect(features.has('stemmingDictionaries')).toBe(true);
        expect(features.has('naturalLanguageSearch')).toBe(false);
    });

    it('v29 adds natural language search', () => {
        const features = getAvailableFeatures('29.0');
        expect(features.has('naturalLanguageSearch')).toBe(true);
        expect(features.has('synonymsGlobal')).toBe(false);
    });

    it('v30 has everything', () => {
        const features = getAvailableFeatures('30.0');
        const allFeatures = Object.keys(FEATURE_MIN_VERSIONS);
        for (const f of allFeatures) {
            expect(features.has(f)).toBe(true);
        }
    });
});

// ─── formatVersion ───────────────────────────────────────────────────────────

describe('formatVersion', () => {
    it('formats old-style version', () => {
        expect(formatVersion('0.25.2')).toBe('v0.25.2');
    });

    it('formats new-style version without patch', () => {
        expect(formatVersion('26.0')).toBe('v26.0');
    });

    it('formats new-style version with patch', () => {
        expect(formatVersion('27.1.3')).toBe('v27.1.3');
    });

    it('accepts ParsedVersion', () => {
        expect(formatVersion(parseVersion('30.0'))).toBe('v30.0');
    });
});
