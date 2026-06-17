import Link from 'next/link';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const navItems = [
    { href: '/dashboard', label: 'Overview' },
    { href: '/dashboard/customers', label: 'Customers' },
    { href: '/dashboard/dispatch', label: 'Dispatch' },
    { href: '/dashboard/invoices', label: 'Invoices' },
    { href: '/dashboard/job-costing', label: 'Job Costing' },
    { href: '/dashboard/reporting', label: 'Reporting' },
    { href: '/dashboard/audit-logs', label: 'Audit Logs' },
  ];

  return (
    <div className="min-h-screen flex bg-gray-50">
      <aside className="w-64 bg-slate-800 text-white p-4 space-y-2">
        <h2 className="text-lg font-bold mb-4 px-2">Home Services</h2>
        <nav className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block px-3 py-2 rounded text-sm text-slate-300 hover:bg-slate-700 hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
