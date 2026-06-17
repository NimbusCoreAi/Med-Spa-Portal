export default function DispatchPage() {
  const jobs = [
    { id: 'J-001', customer: 'John Smith', technician: 'Mike D.', service: 'HVAC Repair', time: '9:00 AM', status: 'scheduled' },
    { id: 'J-002', customer: 'Sarah J.', technician: 'Tom W.', service: 'Plumbing', time: '11:00 AM', status: 'in_progress' },
    { id: 'J-003', customer: 'Bob L.', technician: 'Unassigned', service: 'Cleaning', time: '2:00 PM', status: 'scheduled' },
  ];

  const statusColors: Record<string, string> = {
    scheduled: 'bg-blue-100 text-blue-700',
    in_progress: 'bg-yellow-100 text-yellow-700',
    completed: 'bg-green-100 text-green-700',
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dispatch Calendar</h1>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Job</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Technician</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {jobs.map((j) => (
              <tr key={j.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{j.id}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{j.customer}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{j.technician}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{j.service}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{j.time}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[j.status]}`}>
                    {j.status.replace('_', ' ')}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
