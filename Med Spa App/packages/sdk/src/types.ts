export interface SmsReminderParams {
  patient_phone: string;
  patient_name: string;
  appointment_time: string;
  clinic_name: string;
  template?: 'pre-appointment' | 'intake-reminder';
  intake_url?: string;
  appointment_id?: string;
}

export interface DeductPackageParams {
  package_id: string;
  patient_id: string;
  clinic_id: string;
  appointment_id?: string;
  performed_by?: string;
}

export interface TreatmentMetricsParams {
  clinic_id: string;
  from?: string;
  to?: string;
  group_by?: 'provider' | 'service_type' | 'month';
}

export interface RiskScoreParams {
  tenant_id: string;
  customer_id?: string;
}

export interface ChurnPredictionParams {
  tenant_id: string;
  customer_id?: string;
}

export interface MarketplaceBrowseParams {
  vertical?: string;
  category?: string;
  q?: string;
  page?: number;
  page_size?: number;
}

export interface MarketplaceInstallParams {
  clinic_id: string;
  module_id: string;
}

export interface ChurnPredictionResult {
  tenant_id: string;
  customer_id: string | null;
  churn_probability: number;
  confidence: number;
  risk_level: string;
  factors: string[];
  recommendation: string;
  evaluated_at: string;
}
