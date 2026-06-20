import { NextRequest, NextResponse } from 'next/server';
import { getMissingRequiredEnv } from '@/lib/env-check';

export async function middleware(request: NextRequest) {
  // ── Env-var guard ──────────────────────────────────────────────
  // If Supabase env vars are missing, short-circuit with a clear error
  // instead of letting every route crash with "Failed to load".
  //
  // Middleware runs on Edge, so we can only check NEXT_PUBLIC_* vars here
  // (they're inlined at build time). If these are missing, the server-only
  // vars (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY) are almost certainly
  // missing too — the server-side SetupError catches the edge case.
  const missingEdge = getMissingRequiredEnv(true);
  if (missingEdge.length > 0) {
    // API routes: return a descriptive 503 JSON
    if (request.nextUrl.pathname.startsWith('/api/')) {
      return NextResponse.json(
        {
          error:
            'Supabase environment variables are not configured. ' +
            'Add them in Railway → Variables (or .env.local locally).',
          missing: missingEdge,
        },
        { status: 503 }
      );
    }
    // Dashboard routes: let through — the layout renders a setup guide.
  }

  return NextResponse.next({ request });
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/:path*'],
};
