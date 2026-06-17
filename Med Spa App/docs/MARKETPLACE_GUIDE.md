# Baseplate Marketplace — Developer Guide

This guide walks you through creating, testing, and publishing a marketplace module.

## Prerequisites

- Node.js 20+
- A Baseplate project (or standalone — modules can be developed independently)
- A Supabase project for local testing

## Step 1: Create Your Module

```bash
mkdir my-module && cd my-module
npm init -y
```

Create `manifest.json`:

```json
{
  "name": "My Module",
  "description": "Does something useful for med spas",
  "version": "1.0.0",
  "author": "you@example.com",
  "vertical": "med-spa",
  "category": "automation",
  "pricing": {
    "model": "subscription",
    "priceCents": 4900,
    "interval": "month"
  },
  "entryPoint": "src/index.ts"
}
```

## Step 2: Build Your Module

Create `src/pages/index.tsx`:

```tsx
export default function MyModulePage() {
  return (
    <div className="p-8">
      <h1>My Module</h1>
      <p>This page appears in the portal when the module is installed.</p>
    </div>
  );
}
```

Create `src/api/index.ts`:

```typescript
import { getServiceSupabaseClient } from '@baseplate/core/config';
import { logAction } from '@baseplate/core/audit-logs';

export async function handleRequest(req: Request) {
  const supabase = getServiceSupabaseClient();
  // Your module logic here

  await logAction({
    clinicId: req.headers.get('x-clinic-id')!,
    userId: 'module',
    action: 'my_module.executed',
    resourceType: 'module',
    resourceId: 'my-module',
  });

  return Response.json({ success: true });
}
```

## Step 3: Test Locally

1. Copy your module into `examples/` in the Baseplate monorepo
2. Run `pnpm install` to register it
3. Start the dev server: `pnpm dev`
4. Navigate to your module page in the portal

## Step 4: Write Tests

Create `src/__tests__/module.test.ts`:

```typescript
import { describe, it, expect } from '@jest/globals';

describe('My Module', () => {
  it('does something useful', () => {
    expect(true).toBe(true);
  });
});
```

## Step 5: Publish

1. **Create a GitHub repo** for your module
2. **Open a PR** to the Baseplate repo with your module in `examples/`
3. **Include:**
   - `manifest.json`
   - `README.md` with setup instructions
   - Tests covering core functionality
4. **Baseplate team reviews** within 5-7 business days
5. **Approved** modules appear in the marketplace browse page

## Step 6: Revenue

- Your module appears in the marketplace with your set price
- Clinics browse and install with one click
- Stripe handles billing
- You receive 80% of revenue, paid monthly via Stripe Connect
- Baseplate retains 20% for hosting, billing, and distribution

## Example Module

See `examples/example-module/` for a complete working reference module.

## FAQ

**Can I make my module free?**
Yes — set `"pricing": { "model": "free" }` in your manifest.

**What verticals are supported?**
Med Spa and Home Services currently. More verticals coming based on demand.

**Can my module call external APIs?**
Yes — your module can call any external API. List required permissions in `manifest.json`.

**How do updates work?**
Increment the `version` in `manifest.json` and submit a new PR. Existing installations get updated automatically.
