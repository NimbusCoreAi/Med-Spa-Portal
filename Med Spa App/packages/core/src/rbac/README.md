# RBAC

Role-based access control — maps roles to permission sets and checks whether a role can perform a given action.

Part of `@baseplate/core`.

## Quick Start

```ts
import { getPermissions, canPerform, type Role, type Permission } from '@baseplate/core/rbac';
```

## API

| Export | Signature | Description |
|--------|-----------|-------------|
| `getPermissions` | `(role: Role) => Permission` | Get the full permission set for a role |
| `canPerform` | `(role: Role, action: keyof Permission) => boolean` | Check whether a role is allowed an action |
| `Role` | `'owner' \| 'staff' \| 'patient'` | Union of supported roles |
| `Permission` | `interface` (see below) | Seven boolean permission flags |

### `Permission` interface

```ts
interface Permission {
  canViewAllRecords: boolean;
  canViewAllAppointments: boolean;
  canViewAllPayments: boolean;
  canViewAuditLogs: boolean;
  canManageStaff: boolean;
  canCreateAppointment: boolean;
  canViewOwnData: boolean;
}
```

### Permission matrix

| Action | `owner` | `staff` | `patient` |
|--------|---------|---------|-----------|
| canViewAllRecords | ✓ | ✓ | — |
| canViewAllAppointments | ✓ | ✓ | — |
| canViewAllPayments | ✓ | ✓ | — |
| canViewAuditLogs | ✓ | — | — |
| canManageStaff | ✓ | — | — |
| canCreateAppointment | ✓ | ✓ | — |
| canViewOwnData | ✓ | ✓ | ✓ |

## Usage

```ts
import { getPermissions, canPerform } from '@baseplate/core/rbac';

// Get every permission for a role
const perms = getPermissions('staff');
// → { canViewAllRecords: true, canViewAllAppointments: true, canManageStaff: false, ... }

// Check a single action
if (canPerform('staff', 'canManageStaff')) {
  // won't execute — staff cannot manage staff
}
```

## Environment Variables

None — RBAC is a pure, synchronous module with no external dependencies.

> Vertical-agnostic — permission keys are generic (e.g., `canViewAllRecords`, not `canViewAllPatients`).
