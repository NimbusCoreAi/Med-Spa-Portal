import type { RuleEvaluator, RiskFlag, RuleContext } from '../../types';

const FOLLOW_UP_GAP_DAYS = 14;
const TYPICAL_FOLLOW_UP_DAYS = 7;

export const followUpGapRule: RuleEvaluator = {
  id: 'follow-up-gap',

  evaluate(ctx: RuleContext): RiskFlag[] {
    if (!ctx.customerId) return [];

    const completedAppointments = ctx.appointments
      .filter(
        (a) =>
          a.patient_id === ctx.customerId &&
          a.status === 'completed' &&
          new Date(a.scheduled_time).getTime() <= Date.now()
      )
      .sort(
        (a, b) =>
          new Date(b.scheduled_time).getTime() -
          new Date(a.scheduled_time).getTime()
      );

    if (completedAppointments.length === 0) return [];

    const lastCompleted = completedAppointments[0];
    const daysSinceCompleted = Math.round(
      (Date.now() - new Date(lastCompleted.scheduled_time).getTime()) /
        (24 * 60 * 60 * 1000)
    );

    if (daysSinceCompleted < TYPICAL_FOLLOW_UP_DAYS) return [];

    const futureAppointments = ctx.appointments.filter(
      (a) =>
        a.patient_id === ctx.customerId &&
        new Date(a.scheduled_time).getTime() > Date.now() &&
        a.status === 'scheduled'
    );

    if (futureAppointments.length > 0) return [];

    if (daysSinceCompleted >= FOLLOW_UP_GAP_DAYS) {
      return [
        {
          type: 'follow_up_gap',
          severity: 'low',
          reason: `No follow-up scheduled ${daysSinceCompleted} days after last appointment (typical follow-up is within ${TYPICAL_FOLLOW_UP_DAYS} days)`,
          action: 'Auto-send care instructions + booking link',
          data: {
            days_since_last: daysSinceCompleted,
            last_service: lastCompleted.service_type ?? 'Unknown',
          },
        },
      ];
    }

    return [];
  },
};
