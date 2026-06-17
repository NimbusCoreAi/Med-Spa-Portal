import type { RuleEvaluator, RiskFlag, RuleContext } from '../../types';

const NO_SHOW_WINDOW_DAYS = 90;
const NO_SHOW_THRESHOLD = 2;

export const noShowRiskRule: RuleEvaluator = {
  id: 'no-show-risk',

  evaluate(ctx: RuleContext): RiskFlag[] {
    if (!ctx.customerId) return [];

    const cutoff = Date.now() - NO_SHOW_WINDOW_DAYS * 24 * 60 * 60 * 1000;
    const patientAppointments = ctx.appointments.filter(
      (a) =>
        a.patient_id === ctx.customerId &&
        new Date(a.scheduled_time).getTime() >= cutoff
    );

    const noShows = patientAppointments.filter(
      (a) => a.status === 'cancelled' && !a.intake_completed
    );

    if (noShows.length >= NO_SHOW_THRESHOLD) {
      return [
        {
          type: 'no_show_risk',
          severity: 'high',
          reason: `${noShows.length} no-shows in the last ${NO_SHOW_WINDOW_DAYS} days`,
          action: 'Send SMS reminder 72h before next appointment',
          data: { no_show_count: noShows.length, window_days: NO_SHOW_WINDOW_DAYS },
        },
      ];
    }

    return [];
  },
};
