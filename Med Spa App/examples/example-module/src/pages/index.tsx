export default function ExampleDashboard() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Example Dashboard</h1>
      <p className="text-gray-600">
        This is a reference marketplace module page. It demonstrates how a module
        adds a new page to the portal when installed.
      </p>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-500">Total Appointments</p>
          <p className="text-3xl font-bold mt-2">142</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-500">Revenue This Month</p>
          <p className="text-3xl font-bold mt-2">$18,400</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-500">Active Patients</p>
          <p className="text-3xl font-bold mt-2">87</p>
        </div>
      </div>
    </div>
  );
}
