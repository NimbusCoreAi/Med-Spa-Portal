const mockSignInWithPassword = jest.fn();
const mockSignUp = jest.fn();
const mockSignOut = jest.fn();
const mockInsert = jest.fn();
const mockStaffInsert = jest.fn();
const mockSelect = jest.fn();
const mockSingle = jest.fn();
const mockFrom = jest.fn();

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    auth: {
      signInWithPassword: mockSignInWithPassword,
      signUp: mockSignUp,
      signOut: mockSignOut
    },
    from: mockFrom
  }))
}));

import { login, signUp, logout } from '../index';

describe('auth module', () => {
  beforeEach(() => {
    process.env.SUPABASE_URL = 'https://example.supabase.co';
    process.env.SUPABASE_ANON_KEY = 'anon-key';
    jest.clearAllMocks();

    mockFrom.mockImplementation((table: string) => {
      if (table === 'staff') return { insert: mockStaffInsert };
      return { insert: mockInsert };
    });
    mockInsert.mockReturnValue({ select: mockSelect });
    mockSelect.mockReturnValue({ single: mockSingle });
    mockStaffInsert.mockResolvedValue({ error: null });
  });

  describe('login', () => {
    it('returns session data on success', async () => {
      mockSignInWithPassword.mockResolvedValue({
        data: { user: { id: 'user-1' }, session: {} },
        error: null
      });

      const result = await login({ email: 'a@b.com', password: 'pw' });

      expect(mockSignInWithPassword).toHaveBeenCalledWith({
        email: 'a@b.com',
        password: 'pw'
      });
      expect(result.user.id).toBe('user-1');
    });

    it('throws when login fails', async () => {
      mockSignInWithPassword.mockResolvedValue({
        data: null,
        error: { message: 'Invalid credentials' }
      });

      await expect(login({ email: 'a@b.com', password: 'wrong' })).rejects.toThrow(
        'Login failed: Invalid credentials'
      );
    });
  });

  describe('signUp', () => {
    it('creates a user, clinic, and staff record on success', async () => {
      mockSignUp.mockResolvedValue({
        data: { user: { id: 'user-1' } },
        error: null
      });
      mockSingle.mockResolvedValue({
        data: { id: 'clinic-1', name: 'My Clinic', owner_id: 'user-1' },
        error: null
      });

      const result = await signUp({
        email: 'a@b.com',
        password: 'pw',
        clinic_name: 'My Clinic'
      });

      expect(result.user.id).toBe('user-1');
      expect(result.clinic.id).toBe('clinic-1');

      expect(mockFrom).toHaveBeenCalledWith('clinics');
      expect(mockInsert).toHaveBeenCalledWith({
        owner_id: 'user-1',
        name: 'My Clinic',
        location: undefined
      });

      expect(mockFrom).toHaveBeenCalledWith('staff');
      expect(mockStaffInsert).toHaveBeenCalledWith({
        id: 'user-1',
        clinic_id: 'clinic-1',
        email: 'a@b.com',
        role: 'owner'
      });
    });

    it('throws when auth signup fails', async () => {
      mockSignUp.mockResolvedValue({ data: null, error: { message: 'Email taken' } });

      await expect(
        signUp({ email: 'a@b.com', password: 'pw', clinic_name: 'My Clinic' })
      ).rejects.toThrow('Signup failed: Email taken');
    });

    it('throws when clinic creation fails', async () => {
      mockSignUp.mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null });
      mockSingle.mockResolvedValue({ data: null, error: { message: 'DB error' } });

      await expect(
        signUp({ email: 'a@b.com', password: 'pw', clinic_name: 'My Clinic' })
      ).rejects.toThrow('Clinic creation failed: DB error');
    });

    it('throws when staff creation fails', async () => {
      mockSignUp.mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null });
      mockSingle.mockResolvedValue({
        data: { id: 'clinic-1', name: 'My Clinic', owner_id: 'user-1' },
        error: null
      });
      mockStaffInsert.mockResolvedValue({ error: { message: 'RLS blocked' } });

      await expect(
        signUp({ email: 'a@b.com', password: 'pw', clinic_name: 'My Clinic' })
      ).rejects.toThrow('Staff creation failed: RLS blocked');
    });
  });

  describe('logout', () => {
    it('signs the user out', async () => {
      mockSignOut.mockResolvedValue({ error: null });

      await logout();

      expect(mockSignOut).toHaveBeenCalled();
    });

    it('throws when logout fails', async () => {
      mockSignOut.mockResolvedValue({ error: { message: 'Network error' } });

      await expect(logout()).rejects.toThrow('Logout failed: Network error');
    });
  });
});
