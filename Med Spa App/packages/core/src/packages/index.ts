import type { SupabaseClient } from '@supabase/supabase-js';
import { getAnonSupabaseClient } from '../config';
import { NotFoundError, ConflictError, AppError } from '../errors';
import type { CreditPackage, PackageTransaction } from '../types';

export interface DeductPackageParams {
  packageId: string;
  patientId: string;
  clinicId: string;
  appointmentId?: string;
  performedBy?: string;
}

export interface DeductPackageResult {
  remaining: number;
  transaction: PackageTransaction;
}

export async function deductPackageSession(
  params: DeductPackageParams,
  client?: SupabaseClient
): Promise<DeductPackageResult> {
  const supabase = client ?? getAnonSupabaseClient();

  const { data, error } = await supabase.rpc('deduct_package_session', {
    p_package_id: params.packageId,
    p_patient_id: params.patientId,
    p_clinic_id: params.clinicId,
    p_appointment_id: params.appointmentId ?? null,
    p_performed_by: params.performedBy ?? null,
  });

  if (error) {
    const msg = error.message;
    if (msg.includes('PACKAGE_NOT_FOUND')) {
      throw new NotFoundError('Credit package');
    }
    if (msg.includes('NO_SESSIONS_REMAINING')) {
      throw new ConflictError('No sessions remaining in package');
    }
    throw new AppError(`Package deduction failed: ${msg}`, 500, 'DEDUCTION_ERROR');
  }

  if (!data || data.length === 0) {
    throw new AppError('Package deduction returned no result', 500, 'DEDUCTION_ERROR');
  }

  const row = data[0];
  const transaction: PackageTransaction = {
    id: row.transaction_id,
    package_id: params.packageId,
    clinic_id: params.clinicId,
    appointment_id: params.appointmentId,
    action: 'deduct',
    previous_balance: row.previous_balance,
    new_balance: row.new_balance,
    performed_by: params.performedBy,
    created_at: new Date(),
  };

  return { remaining: row.remaining_sessions, transaction };
}

export async function getPatientPackages(
  patientId: string,
  clinicId: string,
  client?: SupabaseClient
): Promise<CreditPackage[]> {
  const supabase = client ?? getAnonSupabaseClient();
  const { data, error } = await supabase
    .from('credit_packages')
    .select('*')
    .eq('patient_id', patientId)
    .eq('clinic_id', clinicId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new AppError(`Fetch packages failed: ${error.message}`, 500, 'FETCH_ERROR');
  }

  return (data ?? []) as CreditPackage[];
}
