export default function TableLoading() {
  return (
    <div className="space-y-6" aria-busy="true" role="status">
      <div className="h-8 w-48 animate-pulse rounded bg-gray-200 dark:bg-slate-800" />
      <div className="rounded-lg border border-gray-200 dark:border-slate-800 p-6">
        <div className="space-y-3">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-4 border-b border-gray-100 dark:border-slate-800 pb-3">
              <div className="h-4 flex-1 animate-pulse rounded bg-gray-200 dark:bg-slate-800" />
              <div className="h-4 w-32 animate-pulse rounded bg-gray-200 dark:bg-slate-800" />
              <div className="h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-slate-800" />
              <div className="h-4 w-20 animate-pulse rounded bg-gray-200 dark:bg-slate-800" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
