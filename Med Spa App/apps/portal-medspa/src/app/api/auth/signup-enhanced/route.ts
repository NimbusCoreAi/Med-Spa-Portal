import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabaseClient, createCheckoutSession, logError, logInfo } from '@baseplate/core';
import { checkRateLimit } from '@/lib/request-rate-limit';

interface SignupBody {
  clinic_name?: string;
  owner_name?: string;
  email?: string;
  password?: string;
  phone?: string;
  plan?: 'pilot' | 'connect';
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  if (!checkRateLimit(ip, 5)) {
    return NextResponse.json(
      { error: 'Too many signup attempts. Please try again later.' },
      { status: 429 }
    );
  }

  try {
    const body = (await req.json()) as SignupBody;

    if (!body.email || !body.password || !body.clinic_name) {
      return NextResponse.json(
        { error: 'Missing required fields: clinic_name, email, password' },
        { status: 400 }
      );
    }

    if (body.password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    }

    const plan = body.plan ?? 'pilot';
    const supabase = getServiceSupabaseClient();

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: body.email,
      password: body.password,
      email_confirm: false,
      user_metadata: { name: body.owner_name, phone: body.phone },
    });

    if (authError) {
      // Generic message — never leak authError.message (exposes email enumeration)
      logError(new Error(authError.message), { route: '/api/auth/signup-enhanced', op: 'auth.createUser' });
      return NextResponse.json(
        { error: 'Signup failed. Please check your details and try again.' },
        { status: 400 }
      );
    }

    const userId = authData.user.id;

    const { data: clinic, error: clinicError } = await supabase
      .from('clinics')
      .insert({ name: body.clinic_name })
      .select()
      .single();

    if (clinicError || !clinic) {
      // Compensate: delete the orphaned auth user so the email can be reused
      await supabase.auth.admin.deleteUser(userId).catch((e) =>
        logError(e instanceof Error ? e : new Error(String(e)), { op: 'signup.rollback_user', userId })
      );
      logError(new Error(clinicError?.message ?? 'No clinic returned'), { op: 'signup.clinic', userId });
      return NextResponse.json(
        { error: 'Failed to create account. Please try again.' },
        { status: 500 }
      );
    }

    const { error: staffError } = await supabase.from('staff').insert({
      id: userId,
      clinic_id: clinic.id,
      role: 'owner',
      name: body.owner_name ?? body.email,
      email: body.email,
    });

    if (staffError) {
      // Compensate: remove clinic and auth user so signup can be retried cleanly
      try { await supabase.from('clinics').delete().eq('id', clinic.id); } catch {}
      await supabase.auth.admin.deleteUser(userId).catch(() => {});
      logError(new Error(staffError.message), { op: 'signup.staff', userId, clinicId: clinic.id });
      return NextResponse.json(
        { error: 'Failed to create account. Please try again.' },
        { status: 500 }
      );
    }

    logInfo('signup.success', { clinicId: clinic.id, plan });

    if (plan === 'connect') {
      const { url } = await createCheckoutSession({
        plan: 'connect',
        clinicId: clinic.id,
      });
      return NextResponse.json({ url, plan: 'connect' });
    }

    return NextResponse.json({
      url: `${process.env.NEXT_PUBLIC_APP_URL || ''}/signup/success?plan=pilot`,
      plan: 'pilot',
    });
  } catch (err) {
    logError(err instanceof Error ? err : new Error(String(err)), { route: '/api/auth/signup-enhanced' });
    return NextResponse.json({ error: 'Signup failed. Please try again.' }, { status: 500 });
  }
}
