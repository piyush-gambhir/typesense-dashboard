import typesenseClient from '@/lib/typesense/typesense-client';

export async function listAnalyticsRules() {
  try {
    const rules = await typesenseClient.analytics.rules().retrieve();
    return rules.rules;
  } catch (error) {
    console.error('Error listing analytics rules:', error);
    return null;
  }
}

export async function createAnalyticsRule(ruleName: string, rule: Record<string, any>) {
  try {
    const newRule = await typesenseClient.analytics.rules().upsert(ruleName, rule as any);
    return newRule;
  } catch (error) {
    console.error('Error creating analytics rule:', error);
    return null;
  }
}

export async function deleteAnalyticsRule(ruleName: string) {
  try {
    const deleteResult = await typesenseClient.analytics.rules(ruleName).delete();
    return deleteResult;
  } catch (error) {
    console.error('Error deleting analytics rule:', error);
    return null;
  }
}
