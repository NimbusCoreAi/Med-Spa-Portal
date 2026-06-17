import { NextRequest, NextResponse } from 'next/server';
import { getRooms, createRoom } from '@baseplate/core/scheduling';
import { getUserContext, createServerSupabaseClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const ctx = await getUserContext();
  if (!ctx) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const client = createServerSupabaseClient();
    const rooms = await getRooms(ctx.clinicId, client);
    return NextResponse.json(rooms);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to load rooms' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const ctx = await getUserContext();
  if (!ctx) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { name?: string; capacity?: number };
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
    const room = await createRoom(
      { clinicId: ctx.clinicId, name: body.name, capacity: body.capacity },
      client
    );
    return NextResponse.json(room);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to create room' }, { status: 500 });
  }
}
