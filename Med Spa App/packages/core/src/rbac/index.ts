import type { Role, Permission } from './types';

export type { Role, Permission, PermissionKeys, RBACConfig, RBACInstance } from './types';
export { mergePermissions, FULL_PERMISSIONS, NO_PERMISSIONS } from './types';
export { createRBAC } from './factory';

const PERMISSIONS: Readonly<Record<Role, Permission>> = Object.freeze({
  owner: Object.freeze<Permission>({
    canViewAllRecords: true,
    canViewAllAppointments: true,
    canViewAllPayments: true,
    canViewAuditLogs: true,
    canManageStaff: true,
    canCreateAppointment: true,
    canViewOwnData: true
  }),
  staff: Object.freeze<Permission>({
    canViewAllRecords: true,
    canViewAllAppointments: true,
    canViewAllPayments: true,
    canViewAuditLogs: false,
    canManageStaff: false,
    canCreateAppointment: true,
    canViewOwnData: true
  }),
  patient: Object.freeze<Permission>({
    canViewAllRecords: false,
    canViewAllAppointments: false,
    canViewAllPayments: false,
    canViewAuditLogs: false,
    canManageStaff: false,
    canCreateAppointment: false,
    canViewOwnData: true
  })
});

export function getPermissions(role: Role): Readonly<Permission> {
  return PERMISSIONS[role];
}

export function canPerform(role: Role, action: keyof Permission): boolean {
  const perms = PERMISSIONS[role];
  if (!perms) return false;
  return perms[action] ?? false;
}
