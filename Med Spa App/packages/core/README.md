# @baseplate/core

Reusable foundation modules for Baseplate infrastructure.

## Modules

- **auth**: Authentication + session management (Supabase-backed)
- **rbac**: Role-based access control
- **audit-logs**: Compliance audit logging
- **encryption**: Data encryption utilities (tweetnacl secretbox)
- **types**: Shared TypeScript types
- **config**: Environment configuration

All modules are vertical-agnostic and reusable across med spas, contractors, home services, etc.

## Quick Start

```typescript
import { login, signUp, logout, getPermissions, canPerform, logAction, getAuditLogs, encryptData, decryptData, generateKey } from '@baseplate/core';
```

## Environment Variables

These modules require the following environment variables to be set:

| Variable | Used by | Description |
|---|---|---|
| `SUPABASE_URL` | auth, audit-logs | Supabase project URL |
| `SUPABASE_ANON_KEY` | auth, audit-logs | Supabase anon/public API key |

See `src/config/index.ts` for the centralized config loader.

## Module Boundaries

This package contains **zero vertical-specific code**. Med spa specific logic (intake forms, scheduling, etc.) lives in `apps/portal-medspa/`. Do not add clinic/patient business rules here — only generic primitives.
