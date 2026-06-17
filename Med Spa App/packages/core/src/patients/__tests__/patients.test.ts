const mockFrom = jest.fn();

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: mockFrom
  }))
}));

import { findOrCreatePatient, getPatients } from '../index';

describe('patients module', () => {
  beforeEach(() => {
    process.env.SUPABASE_URL = 'https://example.supabase.co';
    process.env.SUPABASE_ANON_KEY = 'anon-key';
    jest.clearAllMocks();
  });

  it('returns an existing patient matched by clinic + email', async () => {
    const patient = { id: 'patient-1', clinic_id: 'clinic-1', email: 'jane@example.com' };
    const single = jest.fn().mockResolvedValue({ data: patient, error: null });
    const select = jest.fn().mockReturnValue({ single });
    const upsert = jest.fn().mockReturnValue({ select });
    mockFrom.mockReturnValue({ upsert });

    const result = await findOrCreatePatient({
      clinicId: 'clinic-1',
      email: 'jane@example.com',
      firstName: 'Jane',
      lastName: 'Doe'
    });

    expect(mockFrom).toHaveBeenCalledWith('patients');
    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({ clinic_id: 'clinic-1', email: 'jane@example.com', first_name: 'Jane', last_name: 'Doe' }),
      { onConflict: 'clinic_id,email', ignoreDuplicates: false }
    );
    expect(result).toEqual(patient);
  });

  it('creates a new patient via upsert when no match is found', async () => {
    const created = { id: 'patient-2', clinic_id: 'clinic-1', email: 'new@example.com' };
    const single = jest.fn().mockResolvedValue({ data: created, error: null });
    const select = jest.fn().mockReturnValue({ single });
    const upsert = jest.fn().mockReturnValue({ select });
    mockFrom.mockReturnValue({ upsert });

    const result = await findOrCreatePatient({
      clinicId: 'clinic-1',
      email: 'new@example.com',
      firstName: 'New',
      lastName: 'Patient'
    });

    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({ clinic_id: 'clinic-1', email: 'new@example.com', first_name: 'New', last_name: 'Patient' }),
      { onConflict: 'clinic_id,email', ignoreDuplicates: false }
    );
    expect(result).toEqual(created);
  });

  it('creates a new patient directly when no email is provided', async () => {
    const created = { id: 'patient-3', clinic_id: 'clinic-1' };
    const single = jest.fn().mockResolvedValue({ data: created, error: null });
    const select = jest.fn().mockReturnValue({ single });
    const insert = jest.fn().mockReturnValue({ select });
    mockFrom.mockReturnValue({ insert });

    const result = await findOrCreatePatient({
      clinicId: 'clinic-1',
      firstName: 'Walk',
      lastName: 'In'
    });

    expect(mockFrom).toHaveBeenCalledWith('patients');
    expect(result).toEqual(created);
  });

  it('throws when create fails', async () => {
    const single = jest.fn().mockResolvedValue({ data: null, error: { message: 'DB error' } });
    const select = jest.fn().mockReturnValue({ single });
    const insert = jest.fn().mockReturnValue({ select });
    mockFrom.mockReturnValue({ insert });

    await expect(
      findOrCreatePatient({ clinicId: 'clinic-1', firstName: 'A', lastName: 'B' })
    ).rejects.toThrow('Create patient failed: DB error');
  });

  it('throws when the upsert fails', async () => {
    const single = jest.fn().mockResolvedValue({ data: null, error: { message: 'DB error' } });
    const select = jest.fn().mockReturnValue({ single });
    const upsert = jest.fn().mockReturnValue({ select });
    mockFrom.mockReturnValue({ upsert });

    await expect(
      findOrCreatePatient({ clinicId: 'clinic-1', email: 'x@example.com', firstName: 'A', lastName: 'B' })
    ).rejects.toThrow('findOrCreatePatient failed: DB error');
  });

  describe('getPatients', () => {
    it('returns patients for a clinic', async () => {
      const patients = [{ id: 'patient-1', clinic_id: 'clinic-1' }];
      const range = jest.fn().mockResolvedValue({ data: patients, error: null, count: patients.length });
      const order = jest.fn().mockReturnValue({ range });
      const eq = jest.fn().mockReturnValue({ order });
      const select = jest.fn().mockReturnValue({ eq });
      mockFrom.mockReturnValue({ select });

      const result = await getPatients('clinic-1');

      expect(mockFrom).toHaveBeenCalledWith('patients');
      expect(eq).toHaveBeenCalledWith('clinic_id', 'clinic-1');
      expect(range).toHaveBeenCalledWith(0, 49);
      expect(result).toEqual({ patients, total: patients.length });
    });

    it('throws when fetch fails', async () => {
      const range = jest.fn().mockResolvedValue({ data: null, error: { message: 'DB error' }, count: 0 });
      const order = jest.fn().mockReturnValue({ range });
      const eq = jest.fn().mockReturnValue({ order });
      const select = jest.fn().mockReturnValue({ eq });
      mockFrom.mockReturnValue({ select });

      await expect(getPatients('clinic-1')).rejects.toThrow('Fetch patients failed: DB error');
    });
  });
});
