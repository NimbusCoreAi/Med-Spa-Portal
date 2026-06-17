const mockCreateClient = jest.fn(() => ({ from: jest.fn() }));

jest.mock('@supabase/supabase-js', () => ({
  createClient: mockCreateClient
}));

import { getSupabaseConfig, getSupabaseServiceConfig, getAnonSupabaseClient, getServiceSupabaseClient } from '../index';

describe('config module', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_ANON_KEY;
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('returns config from server-side env vars', () => {
    process.env.SUPABASE_URL = 'https://example.supabase.co';
    process.env.SUPABASE_ANON_KEY = 'anon-key';

    expect(getSupabaseConfig()).toEqual({
      url: 'https://example.supabase.co',
      anonKey: 'anon-key'
    });
  });

  it('falls back to NEXT_PUBLIC_ env vars for client-side usage', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key';

    expect(getSupabaseConfig()).toEqual({
      url: 'https://example.supabase.co',
      anonKey: 'anon-key'
    });
  });

  it('throws when no URL is set', () => {
    process.env.SUPABASE_ANON_KEY = 'anon-key';

    expect(() => getSupabaseConfig()).toThrow('Missing Supabase configuration');
  });

  it('throws when no anon key is set', () => {
    process.env.SUPABASE_URL = 'https://example.supabase.co';

    expect(() => getSupabaseConfig()).toThrow('Missing Supabase configuration');
  });

  describe('getSupabaseServiceConfig', () => {
    it('returns service-role config when set', () => {
      process.env.SUPABASE_URL = 'https://example.supabase.co';
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-key';

      expect(getSupabaseServiceConfig()).toEqual({
        url: 'https://example.supabase.co',
        serviceRoleKey: 'service-role-key'
      });
    });

    it('throws when the service role key is missing', () => {
      process.env.SUPABASE_URL = 'https://example.supabase.co';

      expect(() => getSupabaseServiceConfig()).toThrow('Missing Supabase configuration');
    });

    it('throws when the URL is missing', () => {
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-key';

      expect(() => getSupabaseServiceConfig()).toThrow('Missing Supabase configuration');
    });
  });

  describe('getAnonSupabaseClient', () => {
    it('creates a client using the anon key', () => {
      process.env.SUPABASE_URL = 'https://example.supabase.co';
      process.env.SUPABASE_ANON_KEY = 'anon-key';
      mockCreateClient.mockClear();

      getAnonSupabaseClient();

      expect(mockCreateClient).toHaveBeenCalledWith('https://example.supabase.co', 'anon-key');
    });
  });

  describe('getServiceSupabaseClient', () => {
    it('creates a client using the service-role key', () => {
      process.env.SUPABASE_URL = 'https://example.supabase.co';
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-key';
      mockCreateClient.mockClear();

      getServiceSupabaseClient();

      expect(mockCreateClient).toHaveBeenCalledWith('https://example.supabase.co', 'service-role-key');
    });
  });
});
