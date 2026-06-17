# Baseplate Marketplace Module Spec

## What is a Module?

A marketplace module is an extension to a Baseplate portal that adds new features, pages, or integrations without modifying the core platform. Modules are built by third-party developers and distributed through the Baseplate Marketplace.

## Module Structure

```
my-module/
  package.json          # Node.js package metadata
  manifest.json         # Baseplate module manifest (required)
  README.md             # Module documentation
  src/
    pages/              # UI pages rendered in portal
      index.tsx         # Main page
    api/                # API endpoints
      index.ts          # Route handlers
```

## manifest.json

```json
{
  "name": "Advanced Invoicing",
  "description": "QuickBooks and Xero sync for invoices",
  "version": "1.0.0",
  "author": "john@example.com",
  "vertical": "med-spa",
  "category": "integration",
  "pricing": {
    "model": "subscription",
    "priceCents": 4900,
    "interval": "month"
  },
  "entryPoint": "src/index.ts",
  "dependencies": {
    "@baseplate/core": "^0.1.0"
  },
  "permissions": [
    "read:appointments",
    "read:payments",
    "write:invoices"
  ],
  "api_endpoints": [
    "/api/accounting/quickbooks-sync",
    "/api/accounting/xero-sync"
  ],
  "ui_pages": [
    {
      "path": "/advanced-invoicing",
      "label": "Invoicing Dashboard"
    }
  ]
}
```

### Manifest Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Display name (max 50 chars) |
| `description` | string | Yes | Short description (max 200 chars) |
| `version` | string | Yes | Semantic version |
| `author` | string | Yes | Author email or GitHub username |
| `vertical` | string | No | Target vertical (`med-spa`, `home-services`, or omit for all) |
| `category` | enum | Yes | `integration`, `automation`, `reporting`, `ai`, `ui`, `other` |
| `pricing.model` | enum | Yes | `free`, `one_time`, `subscription`, `usage_based` |
| `pricing.priceCents` | integer | No | Price in cents (required if model is not `free`) |
| `pricing.interval` | string | No | `month` or `year` (for subscription model) |
| `entryPoint` | string | Yes | Entry point file path |
| `dependencies` | object | No | NPM-style dependency map |
| `permissions` | string[] | No | Required Baseplate permissions |
| `api_endpoints` | string[] | No | API paths the module exposes |
| `ui_pages` | object[] | No | UI pages the module adds to the portal |

## Module API Access

Modules can access Baseplate APIs:

```typescript
// Auth from @baseplate/core
import { verifyToken } from '@baseplate/core/auth';

// RBAC from @baseplate/core
import { canPerform } from '@baseplate/core/rbac';

// Audit logging
import { logAction } from '@baseplate/core/audit-logs';

// Portal's Supabase database (read-only by default, RLS-scoped)
import { getServiceSupabaseClient } from '@baseplate/core/config';

// Portal's Connect API
import { ConnectClient } from '@baseplate/sdk';

const client = new ConnectClient(process.env.CONNECT_API_KEY);
await client.sendSmsReminder({ ... });
```

## Security Requirements

1. **No direct database writes** — modules must use Connect API or module API endpoints
2. **RLS-scoped queries** — all Supabase queries are subject to Row-Level Security
3. **No environment variable access** — modules cannot read `.env.local`
4. **Sandboxed execution** — module code runs in isolated context
5. **Permission-scoped** — modules can only access APIs listed in their manifest `permissions`

## Submission Process

1. Build your module using the spec above
2. Test locally with `pnpm dev`
3. Submit via GitHub: create a PR with your module in `examples/`
4. Baseplate team reviews for security and quality (5-7 business days)
5. Approved modules are published to the marketplace

### Review Criteria
- ✅ No hardcoded secrets or credentials
- ✅ All API calls go through Connect API or @baseplate/core
- ✅ Tests cover core functionality
- ✅ README with setup instructions
- ✅ Valid manifest.json

## Pricing Guidelines

| Tier | Price Range | Examples |
|------|-------------|----------|
| Small feature | $29-49/mo | Calendar sync, simple integration |
| Major feature | $99-199/mo | Full accounting system, advanced scheduling |
| Enterprise | $299+/mo | Custom integrations, dedicated support |

Most modules price at $49-99/month.

## Revenue Model

- Developer sets the monthly price
- Customer pays through Baseplate (Stripe)
- Developer receives 80% of revenue
- Baseplate retains 20% (hosting, billing, distribution)
- Payouts processed monthly via Stripe Connect
