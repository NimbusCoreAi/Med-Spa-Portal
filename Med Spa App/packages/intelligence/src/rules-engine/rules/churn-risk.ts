import type { RuleEvaluator, RiskFlag, RuleContext } from '../../types';

const CHURN_GAP_DAYS = 60;
const TYPICAL_BOOKING_CYCLE_DAYS = 28;

export const churnRiskRule: RuleEvaluator = {
  id: 'churn-risk',

  evaluate(ctx: RuleContext): RiskFlag[] {
    if (!ctx.customerId) return [];

    const customerAppointments = ctx.appointments
      .filter((a) => a.patient_id === ctx.customerId)
      .sort(
        (a, b) =>
          new Date(b.scheduled_time).getTime() -
          new Date(a.scheduled_time).getTime()
      );

    if (customerAppointments.length < 2) return [];

    const lastAppointment = customerAppointments[0];
    const daysSinceLast =
      (Date.now() - new Date(lastAppointment.scheduled_time).getTime()) /
      (24 * 60 * 60 * 1000);

    const intervals: number[] = [];
    for (let i = 0; i < customerAppointments.length - 1; i++) {
      const gap =
        (new Date(customerAppointments[i].scheduled_time).getTime() -
          new Date(customerAppointments[i + 1].scheduled_time).getTime()) /
        (24 * 60 * 60 * 1000);
      intervals.push(gap);
    }

    const avgCycle =
      intervals.length > 0
        ? intervals.reduce((sum, v) => sum + v, 0) / intervals.length
        : TYPICAL_BOOKING_CYCLE_DAYS;

    if (avgCycle <= TYPICAL_BOOKING_CYCLE_DAYS && daysSinceLast >= CHURN_GAP_DAYS) {
      return [
        {
          type: 'churn_risk',
          severity: 'medium',
          reason: `No appointment in ${Math.round(daysSinceLast)} days (normally books every ${Math.round(avgCycle)} days)`,
          action: 'Send win-back email with special offer',
          data: {
            days_since_last: Math.round(daysSinceLast),
            avg_booking_cycle: Math.round(avgCycle),
          },
        },
      ];
    }

    return [];
  },
};
