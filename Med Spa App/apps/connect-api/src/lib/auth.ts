import { createHash } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import type { SupabaseClient } from '@supabase/supabase-js';

function hashKey(raw: string): string {
  return createHash('sha256').update(raw).digest('hex');
}

export interface ValidatedKey {
  clinicId: string;
  keyHash: string;
  error: null;
}

export interface KeyError {
  clinicId: null;
  keyHash: null;
  error: NextResponse;
}

export async function validateApiKey(
  req: NextRequest,
  supabase: SupabaseClient
): Promise<ValidatedKey | KeyError> {
  const raw = req.headers.get('x-api-key');
  if (!raw) {
    return {
      clinicId: null,
      keyHash: null,
      error: NextResponse.json({ error: 'Missing x-api-key header' }, { status: 401 }),
    };
  }

  const hash = hashKey(raw);

  const { data } = await supabase
    .from('clinic_api_keys')
    .select('clinic_id')
    .eq('key_hash', hash)
    .is('revoked_at', null)
    .maybeSingle();

  if (!data) {
    return {
      clinicId: null,
      keyHash: null,
      error: NextResponse.json({ error: 'Invalid API key' }, { status: 401 }),
    };
  }

  return { clinicId: data.clinic_id as string, keyHash: hash, error: null };
}
