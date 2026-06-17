export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard Overview</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-500">Active Jobs</p>
          <p className="text-3xl font-bold mt-2">12</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-500">Revenue (MTD)</p>
          <p className="text-3xl font-bold mt-2">$24,500</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-500">Completion Rate</p>
          <p className="text-3xl font-bold mt-2">94%</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-500">Pending Invoices</p>
          <p className="text-3xl font-bold mt-2">8</p>
        </div>
      </div>
    </div>
  );
}
