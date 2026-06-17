import { logApiUsage } from '../usage';

jest.mock('@baseplate/core/config', () => ({
  getServiceSupabaseClient: jest.fn(),
}));

import { getServiceSupabaseClient } from '@baseplate/core/config';

describe('logApiUsage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('inserts a usage record with all fields', async () => {
    const insert = jest.fn().mockResolvedValue({ error: null });
    (getServiceSupabaseClient as jest.Mock).mockReturnValue({
      from: jest.fn(() => ({ insert })),
    });

    await logApiUsage({
      clinicId: 'clinic-1',
      endpoint: '/api/v1/billing/package-deduct',
      statusCode: 200,
      responseTimeMs: 42,
    });

    expect(insert).toHaveBeenCalledWith({
      clinic_id: 'clinic-1',
      endpoint: '/api/v1/billing/package-deduct',
      status_code: 200,
      response_time_ms: 42,
    });
  });

  it('inserts with null clinicId and responseTime when not provided', async () => {
    const insert = jest.fn().mockResolvedValue({ error: null });
    (getServiceSupabaseClient as jest.Mock).mockReturnValue({
      from: jest.fn(() => ({ insert })),
    });

    await logApiUsage({
      endpoint: '/api/health',
      statusCode: 200,
    });

    expect(insert).toHaveBeenCalledWith({
      clinic_id: null,
      endpoint: '/api/health',
      status_code: 200,
      response_time_ms: null,
    });
  });

  it('never throws — swallows errors silently (best-effort logging)', async () => {
    (getServiceSupabaseClient as jest.Mock).mockImplementation(() => {
      throw new Error('DB connection failed');
    });

    await expect(
      logApiUsage({ endpoint: '/api/test', statusCode: 500 })
    ).resolves.toBeUndefined();
  });
});
