import { NextRequest, NextResponse } from 'next/server';
import { getUserContext, createServerSupabaseClient } from '@/lib/supabase/server';
import { searchModules, installModule, uninstallModule, getInstalledModules } from '@baseplate/marketplace';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const listInstalled = searchParams.get('installed') === 'true';

  if (listInstalled) {
    const ctx = await getUserContext();
    if (!ctx) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    try {
      const supabase = createServerSupabaseClient();
      const modules = await getInstalledModules(ctx.clinicId, supabase);
      return NextResponse.json({ installed: modules });
    } catch {
      return NextResponse.json({ error: 'Failed to load installed modules' }, { status: 500 });
    }
  }

  try {
    const supabase = createServerSupabaseClient();
    const result = await searchModules({
      vertical: searchParams.get('vertical') ?? undefined,
      category: searchParams.get('category') as never ?? undefined,
      query: searchParams.get('q') ?? undefined,
      page: parseInt(searchParams.get('page') ?? '1'),
      pageSize: parseInt(searchParams.get('page_size') ?? '20'),
    }, supabase);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: 'Marketplace unavailable' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const ctx = await getUserContext();
  if (!ctx) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { module_id?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!body.module_id) {
    return NextResponse.json({ error: 'module_id is required' }, { status: 400 });
  }

  try {
    const supabase = createServerSupabaseClient();
    const result = await installModule(ctx.clinicId, body.module_id, supabase);
    return NextResponse.json({
      subscription_id: result.subscription.id,
      module_id: result.module.id,
      module_name: result.module.name,
      status: 'active',
      activated_at: result.subscription.activated_at,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Install failed';
    return NextResponse.json({ error: message.includes('already installed') ? 'Module already installed' : 'Install failed' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const ctx = await getUserContext();
  if (!ctx) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const moduleId = searchParams.get('module_id');
  if (!moduleId) {
    return NextResponse.json({ error: 'module_id is required' }, { status: 400 });
  }

  try {
    const supabase = createServerSupabaseClient();
    await uninstallModule(ctx.clinicId, moduleId, supabase);
    return NextResponse.json({ status: 'cancelled' });
  } catch {
    return NextResponse.json({ error: 'Uninstall failed' }, { status: 500 });
  }
}
