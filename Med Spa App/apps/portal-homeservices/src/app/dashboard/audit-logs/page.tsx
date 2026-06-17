export default function AuditLogsPage() {
  const logs = [
    { id: '1', user: 'owner@homeservices.test', action: 'invoice.created', resource: 'INV-001', time: '2 min ago' },
    { id: '2', user: 'dispatch@homeservices.test', action: 'job.assigned', resource: 'J-002', time: '15 min ago' },
    { id: '3', user: 'owner@homeservices.test', action: 'customer.created', resource: 'C-005', time: '1 hour ago' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Audit Logs</h1>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Resource</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {logs.map((l) => (
              <tr key={l.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-900">{l.user}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{l.action}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{l.resource}</td>
                <td className="px-6 py-4 text-sm text-gray-400">{l.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
