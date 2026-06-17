import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { getSupabaseConfig } from '@baseplate/core/config';

const OWNER_ONLY_ROUTES = ['/dashboard/audit-logs', '/dashboard/settings'];

export async function middleware(request: NextRequest) {
  const { url, anonKey } = getSupabaseConfig();

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll().map(({ name, value }) => ({ name, value }));
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  const { data: { user } } = await supabase.auth.getUser();

  if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  if (user) {
    const { data: staff } = await supabase
      .from('staff')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    const role = staff?.role;

    if (role && OWNER_ONLY_ROUTES.some(route => request.nextUrl.pathname.startsWith(route))) {
      if (role !== 'owner') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: ['/dashboard/:path*']
};
