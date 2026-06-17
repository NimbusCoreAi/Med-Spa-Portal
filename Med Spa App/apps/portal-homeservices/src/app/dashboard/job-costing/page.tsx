export default function JobCostingPage() {
  const jobs = [
    { id: 'J-001', service: 'HVAC Repair', materials: 120, labor: 200, total: 450, margin: 130, marginPct: 28.9 },
    { id: 'J-002', service: 'Plumbing', materials: 80, labor: 320, total: 1200, margin: 800, marginPct: 66.7 },
    { id: 'J-003', service: 'Cleaning', materials: 30, labor: 150, total: 280, margin: 100, marginPct: 35.7 },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Job Costing</h1>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Job</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Materials</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Labor</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Margin</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">%</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {jobs.map((j) => (
              <tr key={j.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{j.id}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{j.service}</td>
                <td className="px-6 py-4 text-sm text-gray-500">${j.materials}</td>
                <td className="px-6 py-4 text-sm text-gray-500">${j.labor}</td>
                <td className="px-6 py-4 text-sm text-gray-900">${j.total}</td>
                <td className="px-6 py-4 text-sm font-medium text-green-600">${j.margin}</td>
                <td className={`px-6 py-4 text-sm font-medium ${j.marginPct > 30 ? 'text-green-600' : 'text-yellow-600'}`}>
                  {j.marginPct}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
