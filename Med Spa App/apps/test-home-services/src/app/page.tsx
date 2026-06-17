import { getPermissions, canPerform } from '@baseplate/core';
import type { Tenant, Customer, Resource, Space } from '@baseplate/core';

export const dynamic = 'force-dynamic';

export default function Home() {
  const ownerPerms = getPermissions('owner');
  const technicianPerms = getPermissions('staff');
  const customerPerms = getPermissions('patient');

  const canBook = canPerform('owner', 'canCreateAppointment');
  const canViewAll = canPerform('owner', 'canViewAllRecords');
  const canManageStaff = canPerform('owner', 'canManageStaff');

  const tests = [
    { name: 'Type aliases compile (Tenant, Customer, Resource, Space)', pass: true },
    { name: 'getPermissions(owner) returns all true', pass: ownerPerms.canViewAllRecords && ownerPerms.canManageStaff },
    { name: 'getPermissions(staff) — no staff management', pass: !technicianPerms.canManageStaff },
    { name: 'getPermissions(patient) — own data only', pass: customerPerms.canViewOwnData && !customerPerms.canViewAllRecords },
    { name: 'canPerform(owner, canCreateAppointment)', pass: canBook },
    { name: 'canPerform(owner, canViewAllRecords)', pass: canViewAll },
    { name: 'canPerform(owner, canManageStaff)', pass: canManageStaff },
  ];

  const allPass = tests.every(t => t.pass);

  const _typeCheck: [Tenant, Customer, Resource, Space] | null = null;

  return (
    <main style={{ fontFamily: 'monospace', padding: '2rem', maxWidth: '800px' }}>
      <h1>Cross-Vertical Validation: Home Services</h1>
      <p>Testing @baseplate/core in a non-med-spa context.</p>
      <h2>Results: {allPass ? 'ALL PASS' : 'FAILURES DETECTED'}</h2>
      <ul>
        {tests.map((t, i) => (
          <li key={i} style={{ color: t.pass ? 'green' : 'red' }}>
            {t.pass ? 'PASS' : 'FAIL'} — {t.name}
          </li>
        ))}
      </ul>
      <h2>Type Alias Check</h2>
      <p>Tenant, Customer, Resource, Space types imported successfully (compile-time check). {_typeCheck === null ? 'OK' : ''}</p>
    </main>
  );
}
