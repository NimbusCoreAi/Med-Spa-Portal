import type { RuleEvaluator, RiskFlag, RuleContext } from '../../types';

const REVENUE_DROP_THRESHOLD_PCT = -15;
const COMPARISON_WINDOW_MONTHS = 3;

export const revenueDropRule: RuleEvaluator = {
  id: 'revenue-drop',

  evaluate(ctx: RuleContext): RiskFlag[] {
    const now = Date.now();
    const windowMs = COMPARISON_WINDOW_MONTHS * 30 * 24 * 60 * 60 * 1000;

    const tenantPayments = ctx.payments.filter(
      (p) => p.status === 'completed' &&
        new Date(p.created_at).getTime() >= now - 2 * windowMs
    );

    if (tenantPayments.length < 3) return [];

    const recentPayments = tenantPayments.filter(
      (p) => new Date(p.created_at).getTime() >= now - windowMs
    );
    const priorPayments = tenantPayments.filter(
      (p) =>
        new Date(p.created_at).getTime() < now - windowMs &&
        new Date(p.created_at).getTime() >= now - 2 * windowMs
    );

    if (recentPayments.length === 0 || priorPayments.length === 0) return [];

    const recentRevenue = recentPayments.reduce((sum, p) => sum + p.amount, 0);
    const priorRevenue = priorPayments.reduce((sum, p) => sum + p.amount, 0);

    if (priorRevenue === 0) return [];

    const pctChange = ((recentRevenue - priorRevenue) / priorRevenue) * 100;

    if (pctChange <= REVENUE_DROP_THRESHOLD_PCT) {
      return [
        {
          type: 'revenue_drop',
          severity: 'low',
          reason: `Revenue down ${Math.abs(Math.round(pctChange))}% compared to the prior ${COMPARISON_WINDOW_MONTHS}-month period`,
          action: 'Recommend promotion or package offer to boost revenue',
          data: {
            pct_change: Math.round(pctChange),
            recent_revenue: Math.round(recentRevenue * 100) / 100,
            prior_revenue: Math.round(priorRevenue * 100) / 100,
          },
        },
      ];
    }

    return [];
  },
};
