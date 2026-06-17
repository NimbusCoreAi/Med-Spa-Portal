import type { RBACConfig, RBACInstance, Permission, PermissionKeys } from './types';
import { mergePermissions } from './types';

export function createRBAC<TRoles extends string>(config: RBACConfig<TRoles>): RBACInstance<TRoles> {
  const resolvedPermissions = new Map<TRoles, Permission>();

  for (const role of config.roles) {
    const partial = config.permissions[role] ?? {};
    resolvedPermissions.set(role, mergePermissions(partial));
  }

  return {
    getPermissions(role: TRoles): Permission {
      return resolvedPermissions.get(role) ?? mergePermissions({});
    },

    canPerform(role: TRoles, action: PermissionKeys): boolean {
      const perms = resolvedPermissions.get(role);
      if (!perms) return false;
      return perms[action] ?? false;
    },
  };
}
