import { NextRequest, NextResponse } from 'next/server';
import { login } from '@baseplate/core/auth';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  let body: { email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (!body.email || !body.password) {
    return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
  }

  try {
    const supabase = createServerSupabaseClient();
    const data = await login({ email: body.email, password: body.password }, supabase);
    return NextResponse.json({ session: data.session });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Login failed' },
      { status: 401 }
    );
  }
}
