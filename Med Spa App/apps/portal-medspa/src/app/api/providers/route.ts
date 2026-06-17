import { NextRequest, NextResponse } from 'next/server';
import { getProviders, createProvider } from '@baseplate/core/scheduling';
import { getUserContext, createServerSupabaseClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const ctx = await getUserContext();
  if (!ctx) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const client = createServerSupabaseClient();
    const providers = await getProviders(ctx.clinicId, client);
    return NextResponse.json(providers);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to load providers' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const ctx = await getUserContext();
  if (!ctx) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { name?: string; specialties?: string[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (!body.name) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  }

  try {
    const client = createServerSupabaseClient();
    const provider = await createProvider(
      { clinicId: ctx.clinicId, name: body.name, specialties: body.specialties ?? [] },
      client
    );
    return NextResponse.json(provider);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to create provider' }, { status: 500 });
  }
}
