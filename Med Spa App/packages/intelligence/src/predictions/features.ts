import type { FeatureExtractor } from './types';
import type { RuleContext } from '../types';

export const appointmentFeatures: FeatureExtractor = {
  name: 'appointments',
  extract(ctx: RuleContext): number[] {
    const patientAppts = ctx.customerId
      ? ctx.appointments.filter((a) => a.patient_id === ctx.customerId)
      : ctx.appointments;

    const total = patientAppts.length;
    const completed = patientAppts.filter((a) => a.status === 'completed').length;
    const cancelled = patientAppts.filter((a) => a.status === 'cancelled').length;
    const noShows = patientAppts.filter((a) => a.status === 'cancelled' && !a.intake_completed).length;
    const completionRate = total > 0 ? completed / total : 0;
    const cancelRate = total > 0 ? cancelled / total : 0;
    const noShowRate = total > 0 ? noShows / total : 0;

    return [total, completed, cancelled, noShows, completionRate, cancelRate, noShowRate];
  },
};

export const paymentFeatures: FeatureExtractor = {
  name: 'payments',
  extract(ctx: RuleContext): number[] {
    const patientPayments = ctx.customerId
      ? ctx.payments.filter((p) => p.patient_id === ctx.customerId)
      : ctx.payments;

    const total = patientPayments.length;
    const completed = patientPayments.filter((p) => p.status === 'completed').length;
    const failed = patientPayments.filter((p) => p.status === 'failed').length;
    const totalRevenue = patientPayments
      .filter((p) => p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0);
    const avgPayment = completed > 0 ? totalRevenue / completed : 0;

    return [total, completed, failed, Math.round(totalRevenue * 100) / 100, Math.round(avgPayment * 100) / 100];
  },
};

export const engagementFeatures: FeatureExtractor = {
  name: 'engagement',
  extract(ctx: RuleContext): number[] {
    const userLogs = ctx.customerId
      ? ctx.auditLogs.filter((l) => l.user_id === ctx.customerId)
      : ctx.auditLogs;

    const loginCount = userLogs.filter((l) => l.action === 'login').length;
    const lastLogin = userLogs
      .filter((l) => l.action === 'login')
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];

    const daysSinceLogin = lastLogin
      ? Math.round((Date.now() - new Date(lastLogin.created_at).getTime()) / (24 * 60 * 60 * 1000))
      : -1;

    return [loginCount, daysSinceLogin, userLogs.length];
  },
};

export const allFeatureExtractors: FeatureExtractor[] = [
  appointmentFeatures,
  paymentFeatures,
  engagementFeatures,
];
