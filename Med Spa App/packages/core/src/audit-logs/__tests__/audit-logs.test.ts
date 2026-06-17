const mockInsert = jest.fn();
const mockOrder = jest.fn();
const mockEq = jest.fn();
const mockSelect = jest.fn();
const mockFrom = jest.fn();

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: mockFrom
  }))
}));

import { logAction, getAuditLogs } from '../index';

describe('audit-logs module', () => {
  beforeEach(() => {
    process.env.SUPABASE_URL = 'https://example.supabase.co';
    process.env.SUPABASE_ANON_KEY = 'anon-key';
    jest.clearAllMocks();

    mockFrom.mockReturnValue({ insert: mockInsert, select: mockSelect });
    mockSelect.mockReturnValue({ eq: mockEq });
    mockEq.mockReturnValue({ order: mockOrder });
  });

  describe('logAction', () => {
    it('inserts an audit log entry', async () => {
      mockInsert.mockResolvedValue({ error: null });

      await logAction({
        clinicId: 'clinic-1',
        userId: 'user-1',
        action: 'view_patient',
        resourceType: 'patient',
        resourceId: 'patient-1'
      });

      expect(mockFrom).toHaveBeenCalledWith('audit_logs');
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          clinic_id: 'clinic-1',
          user_id: 'user-1',
          action: 'view_patient',
          resource_type: 'patient',
          resource_id: 'patient-1'
        })
      );
    });

    it('throws when insert fails', async () => {
      mockInsert.mockResolvedValue({ error: { message: 'DB error' } });

      await expect(
        logAction({
          clinicId: 'clinic-1',
          userId: 'user-1',
          action: 'view_patient',
          resourceType: 'patient',
          resourceId: 'patient-1'
        })
      ).rejects.toThrow('Audit log failed: DB error');
    });
  });

  describe('getAuditLogs', () => {
    it('returns audit logs ordered by timestamp descending', async () => {
      const logs = [{ id: 'log-1', action: 'login' }];
      mockOrder.mockResolvedValue({ data: logs, error: null });

      const result = await getAuditLogs('clinic-1');

      expect(mockFrom).toHaveBeenCalledWith('audit_logs');
      expect(mockEq).toHaveBeenCalledWith('clinic_id', 'clinic-1');
      expect(mockOrder).toHaveBeenCalledWith('timestamp', { ascending: false });
      expect(result).toEqual(logs);
    });

    it('throws when fetch fails', async () => {
      mockOrder.mockResolvedValue({ data: null, error: { message: 'DB error' } });

      await expect(getAuditLogs('clinic-1')).rejects.toThrow(
        'Fetch audit logs failed: DB error'
      );
    });
  });
});
