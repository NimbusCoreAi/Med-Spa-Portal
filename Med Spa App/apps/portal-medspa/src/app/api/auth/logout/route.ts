import { NextResponse } from 'next/server';
import { logout } from '@baseplate/core/auth';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function POST() {
  try {
    const supabase = createServerSupabaseClient();
    await logout(supabase);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Logout failed' },
      { status: 500 }
    );
  }
}
