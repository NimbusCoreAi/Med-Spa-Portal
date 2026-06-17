import { getPermissions, canPerform } from '../index';

describe('rbac module', () => {
  describe('getPermissions', () => {
    it('grants owner all permissions', () => {
      const perms = getPermissions('owner');
      expect(perms.canViewAllRecords).toBe(true);
      expect(perms.canViewAllAppointments).toBe(true);
      expect(perms.canViewAllPayments).toBe(true);
      expect(perms.canViewAuditLogs).toBe(true);
      expect(perms.canManageStaff).toBe(true);
      expect(perms.canCreateAppointment).toBe(true);
      expect(perms.canViewOwnData).toBe(true);
    });

    it('grants staff clinic-wide access but not audit logs or staff management', () => {
      const perms = getPermissions('staff');
      expect(perms.canViewAllRecords).toBe(true);
      expect(perms.canViewAllAppointments).toBe(true);
      expect(perms.canViewAllPayments).toBe(true);
      expect(perms.canCreateAppointment).toBe(true);
      expect(perms.canViewAuditLogs).toBe(false);
      expect(perms.canManageStaff).toBe(false);
    });

    it('restricts patients to only their own data', () => {
      const perms = getPermissions('patient');
      expect(perms.canViewOwnData).toBe(true);
      expect(perms.canViewAllRecords).toBe(false);
      expect(perms.canViewAllAppointments).toBe(false);
      expect(perms.canViewAllPayments).toBe(false);
      expect(perms.canViewAuditLogs).toBe(false);
      expect(perms.canManageStaff).toBe(false);
      expect(perms.canCreateAppointment).toBe(false);
    });
  });

  describe('canPerform', () => {
    it('returns true when role has the permission', () => {
      expect(canPerform('owner', 'canManageStaff')).toBe(true);
    });

    it('returns false when role lacks the permission', () => {
      expect(canPerform('staff', 'canViewAuditLogs')).toBe(false);
      expect(canPerform('patient', 'canCreateAppointment')).toBe(false);
    });
  });
});
