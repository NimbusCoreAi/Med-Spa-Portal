import type { RuleEvaluator, RiskFlag, RuleContext } from '../../types';

const ABANDONMENT_DAYS = 90;

export const packageAbandonmentRule: RuleEvaluator = {
  id: 'package-abandonment',

  evaluate(ctx: RuleContext): RiskFlag[] {
    if (!ctx.customerId) return [];

    const customerPackages = ctx.packages.filter(
      (p) => p.patient_id === ctx.customerId && p.remaining_sessions > 0
    );

    const flags: RiskFlag[] = [];

    for (const pkg of customerPackages) {
      const lastUsed = ctx.appointments
        .filter(
          (a) =>
            a.patient_id === ctx.customerId &&
            a.service_type === pkg.service_type &&
            new Date(a.scheduled_time).getTime() <= Date.now()
        )
        .sort(
          (a, b) =>
            new Date(b.scheduled_time).getTime() -
            new Date(a.scheduled_time).getTime()
        )[0];

      const refDate = lastUsed
        ? new Date(lastUsed.scheduled_time)
        : new Date(pkg.created_at);
      const daysSinceActivity = Math.round(
        (Date.now() - refDate.getTime()) / (24 * 60 * 60 * 1000)
      );

      if (daysSinceActivity >= ABANDONMENT_DAYS) {
        flags.push({
          type: 'package_abandonment',
          severity: 'medium',
          reason: `Package "${pkg.service_type ?? 'Package'}" has ${pkg.remaining_sessions} of ${pkg.total_sessions} sessions remaining but no activity in ${daysSinceActivity} days`,
          action: 'Send "complete your package" reminder',
          data: {
            package_id: pkg.id,
            remaining: pkg.remaining_sessions,
            total: pkg.total_sessions,
            days_inactive: daysSinceActivity,
          },
        });
      }
    }

    return flags;
  },
};
