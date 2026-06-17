export default function DashboardLoading() {
  return (
    <div className="space-y-6" aria-busy="true" role="status">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="rounded-lg border border-gray-200 p-6">
            <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
            <div className="mt-3 h-8 w-16 animate-pulse rounded bg-gray-200" />
            <div className="mt-2 h-3 w-20 animate-pulse rounded bg-gray-200" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {[0, 1].map((i) => (
          <div key={i} className="rounded-lg border border-gray-200 p-6">
            <div className="h-5 w-40 animate-pulse rounded bg-gray-200" />
            <div className="mt-4 space-y-3">
              {[0, 1, 2].map((j) => (
                <div key={j} className="flex justify-between">
                  <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
                  <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
