export type Role = 'owner' | 'staff' | 'patient';

export interface Permission {
  canViewAllRecords: boolean;
  canViewAllAppointments: boolean;
  canViewAllPayments: boolean;
  canViewAuditLogs: boolean;
  canManageStaff: boolean;
  canCreateAppointment: boolean;
  canViewOwnData: boolean;
}

export type PermissionKeys = keyof Permission;

export interface RBACConfig<TRoles extends string = Role> {
  roles: TRoles[];
  permissions: Record<TRoles, Partial<Permission>>;
}

export interface RBACInstance<TRoles extends string = Role> {
  getPermissions(role: TRoles): Permission;
  canPerform(role: TRoles, action: PermissionKeys): boolean;
}

const FULL_PERMISSIONS: Permission = {
  canViewAllRecords: true,
  canViewAllAppointments: true,
  canViewAllPayments: true,
  canViewAuditLogs: true,
  canManageStaff: true,
  canCreateAppointment: true,
  canViewOwnData: true,
};

const NO_PERMISSIONS: Permission = {
  canViewAllRecords: false,
  canViewAllAppointments: false,
  canViewAllPayments: false,
  canViewAuditLogs: false,
  canManageStaff: false,
  canCreateAppointment: false,
  canViewOwnData: false,
};

export function mergePermissions(partial: Partial<Permission>): Permission {
  return { ...NO_PERMISSIONS, ...partial };
}

export { FULL_PERMISSIONS, NO_PERMISSIONS };
