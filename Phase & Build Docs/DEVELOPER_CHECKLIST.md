# Developer Checklist: Module Library Integration
## Ensure Modules Get Built + Extracted Automatically

> **🔧 MAINTENANCE:** For current status, see [`../MASTER_PROGRESS.md`](../MASTER_PROGRESS.md). After completing any milestone or significant commit, update it: (1) "At a Glance" table, (2) check off "What's Left" items, (3) add commit to "Build Log".

**For:** Every developer on Phase 1+  
**Purpose:** Prevent med spa specifics from sneaking into `packages/`  
**Frequency:** Check before each commit

---

## Before Writing Any Code

- [ ] Ask: "Is this feature reusable by other verticals?"
  - YES → Goes in `packages/`
  - NO → Goes in `apps/portal-medspa/`

- [ ] Check `MODULES_LIBRARY.md` — Is this module already listed?
  - YES → Build it in `packages/` per spec
  - NO → Add to inventory before building

- [ ] Understand the module's scope:
  - What's vertical-agnostic? (goes in package)
  - What's med spa specific? (goes in app)

---

## During Development

### When Building Auth Logic
- [ ] Create `packages/core/auth/index.ts`
- [ ] Zero med spa references in the module
- [ ] Portal imports: `import { login } from '@baseplate/core/auth'`
- [ ] NOT: `import auth from '../packages/core/auth'` (let bundler resolve)

### When Building Payments
- [ ] Create `packages/integrations/stripe/index.ts`
- [ ] Handle Stripe API calls here
- [ ] Portal calls: `stripe.createInvoice({ amount, clinicId, ... })`
- [ ] Med spa specifics (invoice description, etc.) stay in portal

### When Building UI Components
- [ ] Create `packages/ui/form/index.tsx`
- [ ] Generic form component (no med spa-specific fields)
- [ ] Portal uses: `<Form fields={patientIntakeFields} />`
- [ ] NOT: `<PatientIntakeForm/>` in packages

---

## After Building a Feature

**Checklist before committing:**

- [ ] Feature is working
- [ ] Reusable parts extracted to `packages/`?
- [ ] Module has README.md?
- [ ] Module has tests?
- [ ] Module exported from `packages/[category]/index.ts`?
- [ ] Portal imports from package?
- [ ] Zero med spa specifics in package code?
- [ ] Module documented in `MODULES_LIBRARY.md`?

**Red flags (fix immediately):**
- ❌ Med spa string in `packages/` code
- ❌ Portal-specific logic in `packages/`
- ❌ Import from `apps/` inside `packages/`
- ❌ Circular dependencies

---

## Weekly Module Audit

**Every Friday, verify all modules built this week:**

| Module | In `packages/`? | Has README? | Has Tests? | Has JSDoc? | Zero Med Spa Code? |
|---|---|---|---|---|---|
| auth | ✅ | ✅ | ✅ | ✅ | ✅ |
| rbac | ✅ | ✅ | ✅ | ✅ | ✅ |
| [new module] | ? | ? | ? | ? | ? |

**If anything is ❌**, prioritize fixing before moving on.

---

## Module Quality Checklist

Before declaring a module "done":

### Documentation
- [ ] README.md exists
- [ ] README has: Purpose, Quick Start, API, Parameters, Return Value
- [ ] README has usage examples
- [ ] README documents vertical-specific parts (if any)
- [ ] All exports have JSDoc comments
- [ ] All types documented

### Testing
- [ ] Unit tests exist
- [ ] Happy path tested
- [ ] Error cases tested
- [ ] Edge cases tested
- [ ] >80% code coverage
- [ ] Tests pass locally

### Code Quality
- [ ] No med spa-specific strings
- [ ] No imports from `apps/`
- [ ] TypeScript types complete
- [ ] No console.log() statements
- [ ] Follows naming conventions (kebab-case folders, camelCase exports)

### Integration
- [ ] Exported from `packages/[category]/index.ts`
- [ ] Portal imports and uses it
- [ ] Portal doesn't duplicate module logic
- [ ] Works standalone (doesn't rely on portal context)

---

## Module Extraction Decision Tree

```
┌─ "Is this reusable by another vertical?"
├─ YES → Goes in packages/
│  ├─ Is it auth/payment/email/logging related?
│  │  └─ YES → packages/core/ or packages/integrations/
│  ├─ Is it a UI component?
│  │  └─ YES → packages/ui/
│  └─ Is it a workflow pattern?
│     └─ YES → packages/patterns/
│
└─ NO → Goes in apps/portal-medspa/
   └─ (Med spa specific UI, forms, workflows)
```

---

## Common Mistakes (Avoid These)

### ❌ Mistake 1: Auth Logic Stays in Portal
```typescript
// WRONG - in apps/portal-medspa/pages/login.tsx
async function handleLogin(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({...})
  // Duplicates auth logic
}
```

### ✅ Correct: Auth Module in Packages
```typescript
// RIGHT - in packages/core/auth/index.ts
export async function login(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({...})
}

// Then in portal: apps/portal-medspa/pages/login.tsx
import { login } from '@baseplate/core/auth'
const { data, error } = await login(email, password)
```

---

### ❌ Mistake 2: Med Spa Code in Module
```typescript
// WRONG - in packages/ui/form/index.tsx
export function PatientIntakeForm() {
  // This is med spa specific!
}
```

### ✅ Correct: Generic Form, Med Spa Config in Portal
```typescript
// RIGHT - in packages/ui/form/index.tsx
export function Form({ fields, onSubmit }) {
  // Generic form
}

// Then in portal: apps/portal-medspa/components/PatientIntake.tsx
import { Form } from '@baseplate/ui/form'
export function PatientIntakeForm() {
  const fields = [
    { name: 'allergies', label: 'Allergies', type: 'textarea' },
    // ... med spa specific fields
  ]
  return <Form fields={fields} onSubmit={handleSubmit} />
}
```

---

### ❌ Mistake 3: Forgetting Module Documentation
```typescript
// WRONG - no README, no JSDoc
export async function auditLog(...) { }
```

### ✅ Correct: Documented Module
```typescript
/**
 * Log an action for compliance audit trail.
 * @param clinicId - The clinic performing the action
 * @param userId - The user performing the action
 * @param action - What they did (e.g., 'login', 'view_patient')
 * @returns Promise<{ id, timestamp }>
 */
export async function auditLog(clinicId, userId, action) { }
```

---

### ❌ Mistake 4: Importing Portal Code in Module
```typescript
// WRONG - in packages/core/auth/index.ts
import { ClinicSettings } from '../../../apps/portal-medspa/types'
// Circular dependency!
```

### ✅ Correct: Modules Are Self-Contained
```typescript
// RIGHT - in packages/core/auth/index.ts
import { supabase } from '@baseplate/integrations/supabase'
// Only imports other packages, never imports from apps/
```

---

## Phase 1 Module Checklist (Build-First)

> **Note:** AI-accelerated — phase references replace month/week estimates.

> **Note:** Core modules (Phase 1A-1D) are all built. See `MASTER_PROGRESS.md` for verification. Items below remain unchecked for reference only.

### Phase 1A-1B: Core Modules
- [ ] `packages/core/auth/` built + documented
- [ ] `packages/core/rbac/` built + documented
- [ ] `packages/core/audit-logs/` built + documented
- [ ] `packages/core/encryption/` built + documented
- [ ] `packages/core/types/` created with all shared types
- [ ] `packages/core/config/` created for env vars
- [ ] Portal imports all core modules
- [ ] All modules have 80%+ test coverage

### Phase 1C: UI + Portal
- [ ] `packages/ui/` components built (Button, Input, Form, Table, Modal, Layout)
- [ ] Portal pages created (login, signup, dashboard, booking, intake)

### Phase 1D: Features + Integrations
- [ ] `packages/integrations/stripe/` built + documented
- [ ] `packages/integrations/postmark/` built + documented
- [ ] `packages/integrations/twilio/` built + documented
- [ ] `packages/patterns/` built (admin-setup, invite-user, digital-signature, media-upload)
- [ ] All features have tests

### Phase 1 Build Completion: Module Gaps + Architecture
- [ ] `packages/core/errors/` extracted
- [ ] `packages/core/bookings/` extracted
- [ ] `packages/core/availability/` extracted
- [ ] `@baseplate/hooks/` created
- [ ] `@baseplate/next-api/` created
- [ ] `packages/core/notifications/` extracted
- [ ] `@baseplate/dates/` created
- [ ] `packages/patterns/form-builder/` extracted from app
- [ ] `packages/patterns/consent-form/` extracted from app
- [ ] RBAC on all dashboard routes
- [ ] Multi-tenant isolation (clinicId from session)
- [ ] HIPAA compliance resolved
- [ ] Staging deploy + smoke test passed
- [ ] All modules have comprehensive READMEs
- [ ] Zero med spa specifics in any package

---

## Verification: Is This Module Ready for Phase 2?

Before Phase 2 open-source launch, verify:

### For Each Module:
- [ ] Works for med spas? ✅
- [ ] Works for other verticals? (theoretical test)
- [ ] Documentation complete?
- [ ] Tests >80% coverage?
- [ ] No med spa code?
- [ ] No hardcoded values?
- [ ] Exports clean + documented?

### If ANY module fails above checks:
- STOP
- Extract med spa specifics to portal
- Make module truly vertical-agnostic
- Add missing documentation
- Add missing tests

**DO NOT proceed to Phase 2 until ALL modules pass.**

---

## Commands to Verify Module Health

```bash
# Check all modules have README
find packages -type d -name "node_modules" -prune -o -type d -print | grep -v node_modules | while read dir; do
  [ -f "$dir/README.md" ] || echo "MISSING README: $dir"
done

# Check test coverage (if using Jest)
npm run test -- --coverage

# Check for med spa references in packages
grep -r "medspa\|clinic\|patient" packages/ --include="*.ts" --include="*.tsx" | grep -v ".test."

# Build packages (verify no circular dependencies)
npm run build
```

---

## Success Criteria

**Phase 1 module library is complete when:**
- ✅ 30+ modules in `packages/`
- ✅ ALL modules documented
- ✅ ALL modules >80% test coverage
- ✅ Module library gaps closed (errors, bookings, availability, hooks, next-api, etc.)
- ✅ RBAC on all routes, multi-tenant isolation working
- ✅ HIPAA compliance resolved
- ✅ Portal uses all modules (not duplicating logic)
- ✅ Each module can work standalone
- ✅ Staging smoke test passed
- ✅ Ready for Phase 2 generalization

**If any of above is missing = NOT READY for Phase 2.**

---

This checklist ensures modules get built automatically as a side effect of building the med spa portal. By Phase 1 Exit, you have production-ready infrastructure modules, not just a med spa app.

