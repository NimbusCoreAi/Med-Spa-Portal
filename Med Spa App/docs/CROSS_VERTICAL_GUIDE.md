# Building a New Vertical on Baseplate

## What You Get For Free

- Authentication (Supabase Auth)
- RBAC (role-based access control with generic permission keys)
- Audit logging
- Encryption module
- Scheduling (providers, rooms, appointments)
- Intake forms (dynamic, configurable)
- Payments (Stripe)
- Notifications (email + SMS via Connect API)
- Reporting (server-side aggregation via Connect API)
- Credit packages + deduction (via Connect API)
- All UI components (Button, Input, Form, Table, Modal, Layout)
- All patterns (FormBuilder, ConsentForm, SignatureCapture, etc.)

## What You Configure Per Vertical

| Concept | Med Spa Config | Home Services Config | Fitness Config |
|---------|---------------|---------------------|----------------|
| Tenant | "Clinic" | "Company" | "Studio" |
| Customer | "Patient" | "Customer" | "Member" |
| Resource | "Provider" | "Technician" | "Trainer" |
| Space | "Room" | "Service Area" | "Court/Lane" |
| Service | "Treatment" | "Repair" | "Class" |
| Intake | "Medical History" | "Problem Description" | "Health Goals" |

## Type Aliases

Use the generic aliases from `@baseplate/core`:

```typescript
import type { Tenant, Customer, Resource, Space } from '@baseplate/core';
```

These map to the existing types (`Clinic`, `Patient`, `Provider`, `Room`) but let your vertical use natural terminology.

## How to Build

1. Clone the repo
2. Create a new app in `apps/` (copy `portal-medspa` structure as starting point)
3. Configure labels/terminology in a constants file
4. Create vertical-specific intake form fields
5. Configure Stripe products for your pricing
6. Deploy

## What NOT to Change

- `packages/core/*` — these are vertical-agnostic
- `packages/ui/*` — these accept configurable props
- `packages/patterns/*` — these accept configurable props
- `packages/integrations/*` — these wrap external APIs
- `supabase/migrations/*` — the schema works for any vertical
