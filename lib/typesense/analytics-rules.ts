import { AnalyticsRuleSchema } from 'typesense/lib/Typesense/AnalyticsRule';

import { getTypesenseClient } from '@/lib/typesense/typesense-client';

export async function listAnalyticsRules() {
    try {
        const typesenseClient = getTypesenseClient();
        // Typesense v30 returns an array, older servers return { rules: [...] }.
        const rules = (await typesenseClient.analytics.rules().retrieve()) as
            AnalyticsRuleSchema[] | { rules: AnalyticsRuleSchema[] };
        return Array.isArray(rules) ? rules : rules.rules;
    } catch (error) {
        console.error('Error listing analytics rules:', error);
        return null;
    }
}

export async function createAnalyticsRule(
    ruleName: string,
    rule: Record<string, any>,
) {
    try {
        const typesenseClient = getTypesenseClient();
        const newRule = await typesenseClient.analytics
            .rules()
            .upsert(ruleName, rule as any);
        return newRule;
    } catch (error) {
        console.error('Error creating analytics rule:', error);
        return null;
    }
}

export async function getAnalyticsRule(ruleName: string) {
    try {
        const typesenseClient = getTypesenseClient();
        const rule = await typesenseClient.analytics.rules(ruleName).retrieve();
        return rule;
    } catch (error) {
        console.error('Error getting analytics rule:', error);
        return null;
    }
}

export async function updateAnalyticsRule(
    ruleName: string,
    rule: Record<string, any>,
) {
    try {
        const typesenseClient = getTypesenseClient();
        const updatedRule = await typesenseClient.analytics
            .rules()
            .upsert(ruleName, rule as any);
        return updatedRule;
    } catch (error) {
        console.error('Error updating analytics rule:', error);
        return null;
    }
}

export async function deleteAnalyticsRule(ruleName: string) {
    try {
        const typesenseClient = getTypesenseClient();
        const deleteResult = await typesenseClient.analytics
            .rules(ruleName)
            .delete();
        return deleteResult;
    } catch (error) {
        console.error('Error deleting analytics rule:', error);
        return null;
    }
}
