const mockFrom = jest.fn();

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: mockFrom
  }))
}));

import { getDashboardMetrics } from '../index';

function makeQueryResult(result: { data: unknown; error: unknown }) {
  const obj: Record<string, unknown> = {
    eq: jest.fn(() => obj),
    gte: jest.fn(() => obj),
    lte: jest.fn(() => obj),
    then: (resolve: (value: unknown) => unknown) => resolve(result)
  };
  return obj;
}

describe('reporting module', () => {
  beforeEach(() => {
    process.env.SUPABASE_URL = 'https://example.supabase.co';
    process.env.SUPABASE_ANON_KEY = 'anon-key';
    jest.clearAllMocks();
  });

  describe('getDashboardMetrics', () => {
    const appointments = [
      {
        id: 'appt-1',
        status: 'completed',
        provider_id: 'provider-1',
        service_type: 'Consultation',
        intake_completed: true
      },
      {
        id: 'appt-2',
        status: 'completed',
        provider_id: 'provider-1',
        service_type: 'Follow-up',
        intake_completed: true
      },
      {
        id: 'appt-3',
        status: 'cancelled',
        provider_id: 'provider-2',
        service_type: 'Consultation',
        intake_completed: false
      },
      {
        id: 'appt-4',
        status: 'scheduled',
        provider_id: 'provider-2',
        service_type: 'Procedure',
        intake_completed: false
      }
    ];

    const providers = [
      { id: 'provider-1', name: 'Dr. Smith' },
      { id: 'provider-2', name: 'Dr. Lee' }
    ];

    // Revenue is sourced from the payments ledger (amount_cents). $100 + $200
    // of completed payments, both attributed to provider-1 via the appointments.
    const payments = [
      { amount_cents: 10000, appointment_id: 'appt-1', status: 'completed' },
      { amount_cents: 20000, appointment_id: 'appt-2', status: 'completed' },
      { amount_cents: 5000, appointment_id: 'appt-1', status: 'pending' },
      { amount_cents: 15000, appointment_id: null, status: 'completed' }
    ];

    it('computes dashboard metrics from appointments, providers, and payments', async () => {
      const select = jest
        .fn()
        .mockReturnValueOnce(makeQueryResult({ data: appointments, error: null }))
        .mockReturnValueOnce(makeQueryResult({ data: providers, error: null }))
        .mockReturnValueOnce(makeQueryResult({ data: payments, error: null }));
      mockFrom.mockReturnValue({ select });

      const result = await getDashboardMetrics({ clinicId: 'clinic-1' });

      expect(mockFrom).toHaveBeenCalledWith('appointments');
      expect(mockFrom).toHaveBeenCalledWith('providers');
      expect(mockFrom).toHaveBeenCalledWith('payments');

      // Only completed payments with a resolvable provider count; the null
      // appointment_id payment (15000) is excluded from provider attribution
      // but also not added to totalRevenue (it has no appointment in-range…
      // actually it IS completed, so it counts toward totalRevenue).
      expect(result.totalRevenue).toBe((10000 + 20000 + 15000) / 100);
      expect(result.appointmentCounts).toEqual({ scheduled: 1, completed: 2, cancelled: 1 });
      expect(result.noShowRate).toBe(1 / 2);
      expect(result.intakeCompletionRate).toBe(2 / 4);
      expect(result.revenueByProvider).toEqual([{ providerId: 'provider-1', providerName: 'Dr. Smith', revenue: 300 }]);
      expect(result.servicePopularity).toEqual([
        { serviceType: 'Consultation', count: 2 },
        { serviceType: 'Follow-up', count: 1 },
        { serviceType: 'Procedure', count: 1 }
      ]);
    });

    it('returns zeroed metrics when there are no appointments or payments', async () => {
      const select = jest
        .fn()
        .mockReturnValueOnce(makeQueryResult({ data: [], error: null }))
        .mockReturnValueOnce(makeQueryResult({ data: [], error: null }))
        .mockReturnValueOnce(makeQueryResult({ data: [], error: null }));
      mockFrom.mockReturnValue({ select });

      const result = await getDashboardMetrics({ clinicId: 'clinic-1' });

      expect(result).toEqual({
        totalRevenue: 0,
        appointmentCounts: { scheduled: 0, completed: 0, cancelled: 0 },
        noShowRate: 0,
        intakeCompletionRate: 0,
        revenueByProvider: [],
        servicePopularity: []
      });
    });

    it('applies from/to date range filters to the appointments and payments queries', async () => {
      const appointmentsQuery = makeQueryResult({ data: [], error: null });
      const providersQuery = makeQueryResult({ data: [], error: null });
      const paymentsQuery = makeQueryResult({ data: [], error: null });
      const select = jest
        .fn()
        .mockReturnValueOnce(appointmentsQuery)
        .mockReturnValueOnce(providersQuery)
        .mockReturnValueOnce(paymentsQuery);
      mockFrom.mockReturnValue({ select });

      await getDashboardMetrics({ clinicId: 'clinic-1', from: '2026-01-01', to: '2026-01-31' });

      expect(appointmentsQuery.gte).toHaveBeenCalledWith('scheduled_time', '2026-01-01');
      expect(appointmentsQuery.lte).toHaveBeenCalledWith('scheduled_time', '2026-01-31');
      expect(paymentsQuery.gte).toHaveBeenCalledWith('created_at', '2026-01-01');
      expect(paymentsQuery.lte).toHaveBeenCalledWith('created_at', '2026-01-31');
    });

    it('throws when fetching appointments fails', async () => {
      const select = jest.fn().mockReturnValueOnce(makeQueryResult({ data: null, error: { message: 'DB error' } }));
      mockFrom.mockReturnValue({ select });

      await expect(getDashboardMetrics({ clinicId: 'clinic-1' })).rejects.toThrow('Fetch appointments failed: DB error');
    });

    it('throws when fetching providers fails', async () => {
      const select = jest
        .fn()
        .mockReturnValueOnce(makeQueryResult({ data: [], error: null }))
        .mockReturnValueOnce(makeQueryResult({ data: null, error: { message: 'DB error' } }));
      mockFrom.mockReturnValue({ select });

      await expect(getDashboardMetrics({ clinicId: 'clinic-1' })).rejects.toThrow('Fetch providers failed: DB error');
    });

    it('throws when fetching payments fails', async () => {
      const select = jest
        .fn()
        .mockReturnValueOnce(makeQueryResult({ data: [], error: null }))
        .mockReturnValueOnce(makeQueryResult({ data: [], error: null }))
        .mockReturnValueOnce(makeQueryResult({ data: null, error: { message: 'DB error' } }));
      mockFrom.mockReturnValue({ select });

      await expect(getDashboardMetrics({ clinicId: 'clinic-1' })).rejects.toThrow('Fetch payments failed: DB error');
    });
  });
});
