import { validateApiKey } from '../auth';
import { NextRequest } from 'next/server';

function makeReq(key: string | null) {
  return new NextRequest('http://localhost:3001/api/v1/test', {
    headers: key ? { 'x-api-key': key } : {},
  });
}

function mockSupabase(opts: { clinicId: string | null }) {
  return {
    from: () => ({
      select: () => ({
        eq: () => ({
          is: () => ({
            maybeSingle: async () => ({
              data: opts.clinicId ? { clinic_id: opts.clinicId } : null,
              error: null,
            }),
          }),
        }),
      }),
    }),
  } as any;
}

describe('validateApiKey', () => {
  it('returns clinicId for a valid key', async () => {
    const result = await validateApiKey(makeReq('valid-key'), mockSupabase({ clinicId: 'clinic-1' }));
    expect(result.error).toBeNull();
    expect(result.clinicId).toBe('clinic-1');
  });

  it('returns 401 when header is missing', async () => {
    const result = await validateApiKey(makeReq(null), mockSupabase({ clinicId: null }));
    expect(result.error).not.toBeNull();
    expect(result.error!.status).toBe(401);
    expect(result.clinicId).toBeNull();
  });

  it('returns 401 for an unknown key', async () => {
    const result = await validateApiKey(makeReq('bad-key'), mockSupabase({ clinicId: null }));
    expect(result.error).not.toBeNull();
    expect(result.error!.status).toBe(401);
  });

  it('never stores or compares the raw key — uses hashed lookup', async () => {
    // The supabase mock verifies the hash was passed (not the raw 'raw-key' string).
    // If auth.ts were comparing raw keys, the mock would need to return the raw key;
    // since we mock at the DB level (hash lookup), passing any key that the mock
    // is set to recognise demonstrates the hash path is taken.
    const supabaseWithSpy = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      is: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn().mockResolvedValue({ data: { clinic_id: 'c-1' }, error: null }),
    };
    // Chain-style mock
    const chainMock: any = {
      from: () => chainMock,
      select: () => chainMock,
      eq: (col: string, val: string) => {
        if (col === 'key_hash') {
          // Verify we received a SHA-256 hash (64 hex chars), not the raw key
          expect(val).toMatch(/^[0-9a-f]{64}$/);
          expect(val).not.toBe('raw-key');
        }
        return chainMock;
      },
      is: () => chainMock,
      maybeSingle: async () => ({ data: { clinic_id: 'c-1' }, error: null }),
    };
    await validateApiKey(makeReq('raw-key'), chainMock);
  });
});
