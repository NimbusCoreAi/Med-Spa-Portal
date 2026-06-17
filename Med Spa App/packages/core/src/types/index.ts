import type { Role } from '../rbac/types';

export type { Role };

export type FormFieldType = 'text' | 'email' | 'password' | 'tel' | 'date' | 'textarea' | 'checkbox' | 'select';

export interface Clinic {
  id: string;
  name: string;
  location?: string;
  phone?: string;
  num_providers?: number;
  created_at: Date;
  owner_id: string;
}

export interface Staff {
  id: string;
  clinic_id: string;
  email: string;
  name: string;
  role: Exclude<Role, 'patient'>;

  created_at: Date;
}

export interface Patient {
  id: string;
  clinic_id: string;
  email?: string;
  phone?: string;
  first_name: string;
  last_name: string;
  created_at: Date;
}

export interface AuditLog {
  id: string;
  clinic_id: string;
  user_id: string;
  action: string;
  resource_type: string;
  resource_id: string;
  timestamp: Date;
  ip_address?: string;
  user_agent?: string;
}


export interface UserContext {
  userId: string;
  clinicId: string;
  role: Role;
  email: string;
}

export interface IntakeFormField {
  id: string;
  label: string;
  type: Exclude<FormFieldType, 'password'>;
  required?: boolean;
  options?: string[];
  placeholder?: string;
}

export interface IntakeForm {
  id: string;
  clinic_id: string;
  name: string;
  fields: IntakeFormField[];
  created_at: Date;
}

export type IntakeStatus = 'not_started' | 'in_progress' | 'completed';

export interface IntakeSubmission {
  id: string;
  clinic_id: string;
  patient_id: string;
  form_id: string;
  appointment_id?: string;
  responses: Record<string, unknown>;
  signed_consent: boolean;
  signed_at?: Date;
  status: IntakeStatus;
  created_at: Date;
}

export interface Provider {
  id: string;
  clinic_id: string;
  name: string;
  specialties?: string[];
  availability?: Record<string, string[]>;
  created_at: Date;
}

export interface Room {
  id: string;
  clinic_id: string;
  name: string;
  capacity?: number;
  created_at: Date;
}

export type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled';

export type PaymentStatus = 'pending' | 'completed' | 'failed';

export interface Appointment {
  id: string;
  clinic_id: string;
  patient_id: string;
  provider_id?: string;
  room_id?: string;
  service_type?: string;
  scheduled_time: Date;
  duration_minutes: number;
  status: AppointmentStatus;
  intake_completed: boolean;
  payment_completed: boolean;
  amount?: number;
  payment_status: PaymentStatus;
  payment_link_url?: string;
  payment_completed_at?: Date;
  created_at: Date;
}

// ─── Multi-Vertical Type Aliases ───────────────────────────────
export type Tenant = Clinic;
export type Customer = Patient;
export type Resource = Provider;
export type Space = Room;

export interface CreditPackage {
  id: string;
  clinic_id: string;
  patient_id: string;
  name: string;
  service_type?: string;
  total_sessions: number;
  remaining_sessions: number;
  amount_paid?: number;
  purchased_at: Date;
  expires_at?: Date;
  created_at: Date;
}

export interface PackageTransaction {
  id: string;
  package_id: string;
  clinic_id: string;
  appointment_id?: string;
  action: 'purchase' | 'deduct' | 'refund' | 'adjust';
  previous_balance: number;
  new_balance: number;
  performed_by?: string;
  created_at: Date;
}
