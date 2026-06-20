import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  // ⚠️ TEMP: auth bypassed for testing. Replace this file with the original
  // middleware (see git history) to restore auth checks.
  return NextResponse.next({ request });
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
