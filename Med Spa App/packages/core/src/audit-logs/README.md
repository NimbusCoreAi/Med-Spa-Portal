# Audit Logs

Compliance audit logging — records user actions and retrieves audit log entries per clinic via Supabase.

Part of `@baseplate/core`.

## Quick Start

```ts
import { logAction, getAuditLogs, type LogActionParams } from '@baseplate/core/audit-logs';
```

## API

| Export | Signature | Description |
|--------|-----------|-------------|
| `logAction` | `(params: LogActionParams) => Promise<void>` | Record an action in the audit log |
| `getAuditLogs` | `(clinicId: string) => Promise<AuditLogRow[]>` | Retrieve logs for a clinic (most recent first) |
| `LogActionParams` | `interface` (see below) | Params for `logAction` |

### `LogActionParams`

```ts
interface LogActionParams {
  clinicId: string;
  userId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  ipAddress?: string;
  userAgent?: string;
}
```

## Usage

```ts
import { logAction, getAuditLogs } from '@baseplate/core/audit-logs';

// Record an action
await logAction({
  clinicId: 'clinic_123',
  userId: 'user_456',
  action: 'update',
  resourceType: 'patient',
  resourceId: 'patient_789',
  ipAddress: '203.0.113.1',
  userAgent: 'Mozilla/5.0 ...',
});

// Retrieve logs (most recent first)
const logs = await getAuditLogs('clinic_123');
```

## Return Values

- **`logAction`** — Returns `void`; inserts into the `audit_logs` table with a server-generated `timestamp`.
- **`getAuditLogs`** — Returns an array of `audit_logs` rows ordered by `timestamp` descending.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_URL` | Yes (one) | Supabase project URL |
| `SUPABASE_ANON_KEY` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes (one) | Supabase anon key |

> Vertical-agnostic — no med-spa-specific code.
