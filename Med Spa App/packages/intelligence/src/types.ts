export type RiskLevel = 'low' | 'medium' | 'high';

export interface RiskFlag {
  type: string;
  severity: RiskLevel;
  reason: string;
  action: string;
  data?: Record<string, unknown>;
}

export interface RiskScore {
  tenantId: string;
  customerId?: string;
  overallRisk: RiskLevel;
  flags: RiskFlag[];
  recommendation: string;
  evaluatedAt: Date;
}

export interface AppointmentData {
  id: string;
  patient_id: string;
  status: string;
  scheduled_time: string;
  service_type?: string;
  amount?: number;
  payment_status?: string;
  intake_completed?: boolean;
}

export interface PaymentData {
  id: string;
  patient_id?: string;
  amount: number;
  created_at: string;
  status: string;
}

export interface PackageData {
  id: string;
  patient_id: string;
  remaining_sessions: number;
  total_sessions: number;
  service_type?: string;
  expires_at?: string;
  created_at: string;
}

export interface AuditLogData {
  id: string;
  user_id: string;
  action: string;
  created_at: string;
}

export interface RuleContext {
  tenantId: string;
  customerId?: string;
  appointments: AppointmentData[];
  payments: PaymentData[];
  packages: PackageData[];
  auditLogs: AuditLogData[];
}

export interface RuleEvaluator {
  id: string;
  evaluate(ctx: RuleContext): RiskFlag[];
}

export const SEVERITY_RANK: Record<RiskLevel, number> = {
  low: 1,
  medium: 2,
  high: 3,
};

export function maxSeverity(flags: RiskFlag[]): RiskLevel {
  if (flags.length === 0) return 'low';
  return flags.reduce((max, f) =>
    SEVERITY_RANK[f.severity] > SEVERITY_RANK[max] ? f.severity : max
  , 'low' as RiskLevel);
}

export function recommendationFor(level: RiskLevel): string {
  switch (level) {
    case 'high':
      return 'Immediate follow-up recommended. Contact the customer to address risk factors.';
    case 'medium':
      return 'Monitor closely. Consider sending a reminder or promotional offer.';
    case 'low':
    default:
      return 'No concerns detected.';
  }
}
