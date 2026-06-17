import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabaseClient, logError } from '@baseplate/core';
import { getUserContext } from '@/lib/supabase/server';

const HIGH_PRIORITY_KEYWORDS = ['broken', "can't", 'critical', 'error', 'crash', 'not working', 'unable'];

function autoAssignPriority(message: string): 'high' | 'medium' {
  const lower = message.toLowerCase();
  return HIGH_PRIORITY_KEYWORDS.some((kw) => lower.includes(kw)) ? 'high' : 'medium';
}

export async function POST(req: NextRequest) {
  try {
    const ctx = await getUserContext();
    if (!ctx) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await req.json();
    const { category, message } = body as { category?: string; message?: string };

    if (!category || !message) {
      return NextResponse.json({ error: 'Missing required fields: category, message' }, { status: 400 });
    }

    const validCategories = ['bug', 'feature', 'improvement', 'question', 'complaint'];
    if (!validCategories.includes(category)) {
      return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
    }

    const priority = autoAssignPriority(message);
    const supabase = getServiceSupabaseClient();

    const { data, error: insertError } = await supabase
      .from('feedback')
      .insert({
        clinic_id: ctx.clinicId,
        submitted_by: ctx.userId,
        category,
        message,
        priority,
      })
      .select()
      .single();

    if (insertError) throw insertError;

    return NextResponse.json({ id: data.id, status: 'new', priority });
  } catch (err) {
    logError(err instanceof Error ? err : new Error(String(err)), { route: '/api/feedback POST' });
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to submit feedback' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const ctx = await getUserContext();
    if (!ctx) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') ?? '20', 10)));
    const offset = (page - 1) * pageSize;

    const supabase = getServiceSupabaseClient();
    const { data: items, error, count } = await supabase
      .from('feedback')
      .select('*', { count: 'exact' })
      .eq('clinic_id', ctx.clinicId)
      .order('created_at', { ascending: false })
      .range(offset, offset + pageSize - 1);

    if (error) throw error;

    return NextResponse.json({
      items: items ?? [],
      total: count ?? 0,
      page,
      pageSize,
    });
  } catch (err) {
    logError(err instanceof Error ? err : new Error(String(err)), { route: '/api/feedback GET' });
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to fetch feedback' },
      { status: 500 }
    );
  }
}
