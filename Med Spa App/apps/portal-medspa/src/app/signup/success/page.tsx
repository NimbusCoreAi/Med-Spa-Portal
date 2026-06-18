import Link from 'next/link';

export default async function SignupSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string; session_id?: string }>;
}) {
  const params = await searchParams;
  const plan = params.plan ?? 'pilot';

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-slate-900 px-4">
      <div className="max-w-md w-full text-center">
        <svg
          className="mx-auto h-16 w-16 text-green-600 dark:text-green-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
        <h1 className="mt-6 text-2xl font-bold text-gray-900 dark:text-slate-50">
          {plan === 'connect' ? 'Payment received!' : 'Account created!'}
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-slate-400">
          {plan === 'connect'
            ? 'Your Connect subscription is active. You can now access all features.'
            : 'Your pilot account is ready. You have full access for 6 months.'}
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-block rounded-md bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
