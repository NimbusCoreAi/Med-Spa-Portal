import type { SupabaseClient } from '@supabase/supabase-js';
import { deductPackageSession, getPatientPackages } from '../index';
import { NotFoundError, ConflictError, AppError } from '../../errors';

function createRpcMockClient(opts: {
  rpcData?: unknown;
  rpcError?: { message: string } | null;
}) {
  const rpc = jest.fn().mockResolvedValue({
    data: opts.rpcData ?? null,
    error: opts.rpcError ?? null,
  });
  return { rpc } as unknown as SupabaseClient;
}

function createPackagesQueryMockClient(opts: {
  data?: unknown;
  error?: unknown;
}) {
  const orderResult = jest.fn().mockResolvedValue({
    data: opts.data ?? [],
    error: opts.error ?? null,
  });
  const eq2 = jest.fn(() => ({ order: orderResult }));
  const eq1 = jest.fn(() => ({ eq: eq2 }));
  const select = jest.fn(() => ({ eq: eq1 }));

  return {
    from: jest.fn(() => ({ select })),
  } as unknown as SupabaseClient;
}

describe('packages module', () => {
  const baseParams = {
    packageId: 'pkg-1',
    patientId: 'patient-1',
    clinicId: 'clinic-1',
  };

  describe('deductPackageSession', () => {
    it('deducts a session and returns the new balance', async () => {
      const client = createRpcMockClient({
        rpcData: [{
          remaining_sessions: 2,
          transaction_id: 'txn-1',
          previous_balance: 3,
          new_balance: 2,
        }],
      });

      const result = await deductPackageSession(baseParams, client);

      expect(result.remaining).toBe(2);
      expect(result.transaction.id).toBe('txn-1');
      expect(result.transaction.action).toBe('deduct');
      expect(result.transaction.previous_balance).toBe(3);
      expect(result.transaction.new_balance).toBe(2);
    });

    it('passes optional params to the RPC', async () => {
      const rpc = jest.fn().mockResolvedValue({
        data: [{
          remaining_sessions: 4,
          transaction_id: 'txn-2',
          previous_balance: 5,
          new_balance: 4,
        }],
        error: null,
      });
      const client = { rpc } as unknown as SupabaseClient;

      await deductPackageSession({
        ...baseParams,
        appointmentId: 'appt-1',
        performedBy: 'staff-1',
      }, client);

      expect(rpc).toHaveBeenCalledWith('deduct_package_session', {
        p_package_id: 'pkg-1',
        p_patient_id: 'patient-1',
        p_clinic_id: 'clinic-1',
        p_appointment_id: 'appt-1',
        p_performed_by: 'staff-1',
      });
    });

    it('passes null for optional params when not provided', async () => {
      const rpc = jest.fn().mockResolvedValue({
        data: [{
          remaining_sessions: 4,
          transaction_id: 'txn-3',
          previous_balance: 5,
          new_balance: 4,
        }],
        error: null,
      });
      const client = { rpc } as unknown as SupabaseClient;

      await deductPackageSession(baseParams, client);

      expect(rpc).toHaveBeenCalledWith('deduct_package_session', {
        p_package_id: 'pkg-1',
        p_patient_id: 'patient-1',
        p_clinic_id: 'clinic-1',
        p_appointment_id: null,
        p_performed_by: null,
      });
    });

    it('throws NotFoundError when package not found', async () => {
      const client = createRpcMockClient({
        rpcError: { message: 'PACKAGE_NOT_FOUND' },
      });

      await expect(deductPackageSession(baseParams, client)).rejects.toThrow(NotFoundError);
    });

    it('throws ConflictError when no sessions remaining', async () => {
      const client = createRpcMockClient({
        rpcError: { message: 'NO_SESSIONS_REMAINING' },
      });

      await expect(deductPackageSession(baseParams, client)).rejects.toThrow(ConflictError);
    });

    it('throws AppError for other RPC errors', async () => {
      const client = createRpcMockClient({
        rpcError: { message: 'connection timeout' },
      });

      await expect(deductPackageSession(baseParams, client)).rejects.toThrow(AppError);
    });

    it('throws AppError when RPC returns empty result', async () => {
      const client = createRpcMockClient({
        rpcData: [],
      });

      await expect(deductPackageSession(baseParams, client)).rejects.toThrow(AppError);
    });
  });

  describe('getPatientPackages', () => {
    it('returns packages ordered by created_at desc', async () => {
      const mockPackages = [
        { id: 'pkg-a', patient_id: 'patient-1', clinic_id: 'clinic-1', remaining_sessions: 2 },
        { id: 'pkg-b', patient_id: 'patient-1', clinic_id: 'clinic-1', remaining_sessions: 5 },
      ];
      const client = createPackagesQueryMockClient({ data: mockPackages });

      const result = await getPatientPackages('patient-1', 'clinic-1', client);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('pkg-a');
    });

    it('returns empty array when no packages exist', async () => {
      const client = createPackagesQueryMockClient({ data: [] });

      const result = await getPatientPackages('patient-1', 'clinic-1', client);

      expect(result).toEqual([]);
    });

    it('throws AppError on query failure', async () => {
      const client = createPackagesQueryMockClient({
        error: { message: 'permission denied' },
      });

      await expect(getPatientPackages('patient-1', 'clinic-1', client)).rejects.toThrow(AppError);
    });
  });
});
