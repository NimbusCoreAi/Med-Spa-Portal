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
        payment_status: 'completed',
        amount: 100,
        provider_id: 'provider-1',
        service_type: 'Consultation',
        intake_completed: true
      },
      {
        id: 'appt-2',
        status: 'completed',
        payment_status: 'completed',
        amount: 200,
        provider_id: 'provider-1',
        service_type: 'Follow-up',
        intake_completed: true
      },
      {
        id: 'appt-3',
        status: 'cancelled',
        payment_status: 'pending',
        amount: 0,
        provider_id: 'provider-2',
        service_type: 'Consultation',
        intake_completed: false
      },
      {
        id: 'appt-4',
        status: 'scheduled',
        payment_status: 'pending',
        amount: 0,
        provider_id: 'provider-2',
        service_type: 'Procedure',
        intake_completed: false
      }
    ];

    const providers = [
      { id: 'provider-1', name: 'Dr. Smith' },
      { id: 'provider-2', name: 'Dr. Lee' }
    ];

    it('computes dashboard metrics from appointments and providers', async () => {
      const select = jest
        .fn()
        .mockReturnValueOnce(makeQueryResult({ data: appointments, error: null }))
        .mockReturnValueOnce(makeQueryResult({ data: providers, error: null }));
      mockFrom.mockReturnValue({ select });

      const result = await getDashboardMetrics({ clinicId: 'clinic-1' });

      expect(mockFrom).toHaveBeenCalledWith('appointments');
      expect(mockFrom).toHaveBeenCalledWith('providers');

      expect(result.totalRevenue).toBe(300);
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

    it('returns zeroed metrics when there are no appointments', async () => {
      const select = jest
        .fn()
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

    it('applies from/to date range filters to the appointments query', async () => {
      const appointmentsQuery = makeQueryResult({ data: [], error: null });
      const providersQuery = makeQueryResult({ data: [], error: null });
      const select = jest.fn().mockReturnValueOnce(appointmentsQuery).mockReturnValueOnce(providersQuery);
      mockFrom.mockReturnValue({ select });

      await getDashboardMetrics({ clinicId: 'clinic-1', from: '2026-01-01', to: '2026-01-31' });

      expect(appointmentsQuery.gte).toHaveBeenCalledWith('scheduled_time', '2026-01-01');
      expect(appointmentsQuery.lte).toHaveBeenCalledWith('scheduled_time', '2026-01-31');
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
  });
});
