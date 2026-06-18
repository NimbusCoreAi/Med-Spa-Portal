'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { Role } from '@baseplate/core';

interface NavItem {
  label: string;
  href: string;
  ownerOnly?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Calendar', href: '/dashboard/calendar' },
  { label: 'Forms', href: '/dashboard/forms' },
  { label: 'Patients', href: '/dashboard/patients' },
  { label: 'Providers', href: '/dashboard/providers' },
  { label: 'Rooms', href: '/dashboard/rooms' },
  { label: 'Audit Logs', href: '/dashboard/audit-logs', ownerOnly: true }
];

interface DashboardSidebarProps {
  role?: Role;
}

export function DashboardSidebar({ role }: DashboardSidebarProps) {
  const pathname = usePathname();

  const visibleItems = NAV_ITEMS.filter((item) => !item.ownerOnly || role === 'owner');

  return (
    <aside className="w-60 shrink-0 border-r border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-950">
      <div className="px-5 py-4 border-b border-gray-200 dark:border-slate-800">
        <h2 className="text-lg font-bold text-gray-900 dark:text-slate-50">Med Spa Portal</h2>
      </div>
      <nav className="px-2 py-3 space-y-0.5">
        {visibleItems.map((item) => {
          const isActive =
            item.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(item.href.split('/').slice(0, -1).join('/')) ||
                pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block rounded-md px-3 py-2 text-sm font-medium transition ${
                isActive
                  ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400'
                  : 'text-gray-700 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-900'
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
