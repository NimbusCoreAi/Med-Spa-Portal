import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getIntakeForm, getServiceSupabaseClient } from '@baseplate/core';

const querySchema = z.object({
  formId: z.string().min(1)
});

export async function GET(req: NextRequest) {
  const parsed = querySchema.safeParse({
    formId: req.nextUrl.searchParams.get('formId')
  });

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const form = await getIntakeForm(parsed.data.formId, getServiceSupabaseClient());
    return NextResponse.json({ form });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to fetch intake form' }, { status: 500 });
  }
}
