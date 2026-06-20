import { REQUIRED_ENV_VARS } from '@/lib/env-check';

interface Props {
  missing: string[];
}

export function EnvSetupNotice({ missing }: Props) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 py-8">
      <div className="max-w-2xl w-full">
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200 dark:border-amber-900 px-6 py-4">
            <div className="flex items-center gap-3">
              <svg className="h-6 w-6 text-amber-600 dark:text-amber-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
              </svg>
              <h1 className="text-lg font-bold text-amber-900 dark:text-amber-200">
                Setup Required — Environment Variables Missing
              </h1>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <p className="text-sm text-slate-700 dark:text-slate-300">
              The app can&apos;t connect to Supabase because these environment variables
              are not set:
            </p>

            <div className="rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/30 p-4">
              <ul className="space-y-1.5">
                {missing.map((v) => (
                  <li key={v} className="flex items-center gap-2 text-sm font-mono">
                    <span className="text-red-600 dark:text-red-400">✗</span>
                    <span className="text-red-800 dark:text-red-300">{v}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                How to fix this:
              </h2>

              <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <p className="font-medium text-slate-700 dark:text-slate-300">On Railway:</p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>Open your service in the Railway dashboard</li>
                  <li>Go to the <strong>Variables</strong> tab</li>
                  <li>Add all {REQUIRED_ENV_VARS.length} variables below (copy from <code className="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-xs">.env.local</code>)</li>
                  <li>Railway will auto-redeploy</li>
                </ol>
              </div>

              <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <p className="font-medium text-slate-700 dark:text-slate-300">Locally:</p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>Create <code className="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-xs">apps/portal-medspa/.env.local</code></li>
                  <li>Copy from <code className="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-xs">.env.example</code> and fill in values</li>
                  <li>Restart <code className="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-xs">pnpm dev</code></li>
                </ol>
              </div>
            </div>

            <details className="mt-4">
              <summary className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer hover:text-slate-900 dark:hover:text-slate-100">
                Full list of required variables
              </summary>
              <div className="mt-2 rounded-lg bg-slate-900 dark:bg-slate-950 p-4 overflow-x-auto">
                <pre className="text-xs text-slate-300 dark:text-slate-400 leading-relaxed">{`NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key`}</pre>
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
}
