export default function ReportingPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Reporting</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-500">Total Revenue (This Month)</p>
          <p className="text-3xl font-bold mt-2">$24,500</p>
          <p className="text-sm text-green-600 mt-1">+12% vs last month</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-500">Jobs Completed</p>
          <p className="text-3xl font-bold mt-2">48</p>
          <p className="text-sm text-gray-400 mt-1">Avg: $510/job</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-500">Avg Completion Time</p>
          <p className="text-3xl font-bold mt-2">2.5h</p>
          <p className="text-sm text-gray-400 mt-1">Down 15min from last month</p>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Revenue by Service Type</h2>
        <div className="space-y-3">
          {[
            { type: 'HVAC', revenue: 12000, pct: 49 },
            { type: 'Plumbing', revenue: 8500, pct: 35 },
            { type: 'Cleaning', revenue: 4000, pct: 16 },
          ].map((s) => (
            <div key={s.type}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-700">{s.type}</span>
                <span className="text-gray-500">${s.revenue.toLocaleString()} ({s.pct}%)</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${s.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
