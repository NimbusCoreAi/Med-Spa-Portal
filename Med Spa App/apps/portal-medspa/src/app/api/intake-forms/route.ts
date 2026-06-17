import { NextRequest, NextResponse } from 'next/server';
import { getIntakeForms, createIntakeForm, updateIntakeForm } from '@baseplate/core/intake';
import type { IntakeFormField } from '@baseplate/core/intake';
import { getUserContext, createServerSupabaseClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const ctx = await getUserContext();
  if (!ctx) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const client = createServerSupabaseClient();
    const forms = await getIntakeForms(ctx.clinicId, client);
    return NextResponse.json(forms);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to load intake forms' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const ctx = await getUserContext();
  if (!ctx) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { id?: string; name?: string; fields?: IntakeFormField[] };
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
    const fields = body.fields ?? [];

    if (body.id) {
      const updated = await updateIntakeForm(body.id, { name: body.name, fields }, client);
      return NextResponse.json(updated);
    }

    const created = await createIntakeForm(
      { clinicId: ctx.clinicId, name: body.name, fields },
      client
    );
    return NextResponse.json(created);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to save intake form' }, { status: 500 });
  }
}
