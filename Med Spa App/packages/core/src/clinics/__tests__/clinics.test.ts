const mockFrom = jest.fn();

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: mockFrom
  }))
}));

import { getClinic } from '../index';

describe('clinics module', () => {
  beforeEach(() => {
    process.env.SUPABASE_URL = 'https://example.supabase.co';
    process.env.SUPABASE_ANON_KEY = 'anon-key';
    jest.clearAllMocks();
  });

  describe('getClinic', () => {
    it('returns a single clinic by id', async () => {
      const clinic = { id: 'clinic-1', name: 'Glow Med Spa' };
      const single = jest.fn().mockResolvedValue({ data: clinic, error: null });
      const eq = jest.fn().mockReturnValue({ single });
      const select = jest.fn().mockReturnValue({ eq });
      mockFrom.mockReturnValue({ select });

      const result = await getClinic('clinic-1');

      expect(mockFrom).toHaveBeenCalledWith('clinics');
      expect(eq).toHaveBeenCalledWith('id', 'clinic-1');
      expect(result).toEqual(clinic);
    });

    it('throws when fetch fails', async () => {
      const single = jest.fn().mockResolvedValue({ data: null, error: { message: 'DB error' } });
      const eq = jest.fn().mockReturnValue({ single });
      const select = jest.fn().mockReturnValue({ eq });
      mockFrom.mockReturnValue({ select });

      await expect(getClinic('clinic-1')).rejects.toThrow('Fetch clinic failed: DB error');
    });
  });
});
