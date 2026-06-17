import type { RuleEvaluator, RiskScore, RiskLevel } from '../types';
import { maxSeverity, recommendationFor } from '../types';
import { defaultRules } from './rules';
import { buildRuleContext } from './data-fetchers';
import type { SupabaseClient } from '@supabase/supabase-js';

export interface EvaluateRiskParams {
  tenantId: string;
  customerId?: string;
  client?: SupabaseClient;
  rules?: RuleEvaluator[];
}

export async function evaluateRisk(params: EvaluateRiskParams): Promise<RiskScore> {
  const rules = params.rules ?? defaultRules;

  if (params.client) {
    const ctx = await buildRuleContext(params.tenantId, params.customerId, params.client);
    return runRules(ctx, rules);
  }

  throw new Error('evaluateRisk requires a Supabase client. Pass client via params.client.');
}

export function evaluateRiskSync(
  ctx: Parameters<typeof runRules>[0],
  rules?: RuleEvaluator[]
): RiskScore {
  return runRules(ctx, rules ?? defaultRules);
}

function runRules(
  ctx: import('../types').RuleContext,
  rules: RuleEvaluator[]
): RiskScore {
  const flags = rules.flatMap((rule) => {
    try {
      return rule.evaluate(ctx);
    } catch {
      return [];
    }
  });

  const overallRisk: RiskLevel = maxSeverity(flags);

  return {
    tenantId: ctx.tenantId,
    customerId: ctx.customerId,
    overallRisk,
    flags,
    recommendation: recommendationFor(overallRisk),
    evaluatedAt: new Date(),
  };
}

export { buildRuleContext, defaultRules };
