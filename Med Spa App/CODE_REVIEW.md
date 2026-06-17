# Code Review — Med Spa App (Baseplate OS monorepo)

> Whole-codebase audit, **2026-06-16**. Production-mode `/audit` fan-out: 11 specialist reviewers
> (security, authz, data-integrity, concurrency, contracts, perf, error-boundaries, loading-states,
> observability, accessibility, client-bundle) + type-safety/duplication scan.
> Baseline: `pnpm typecheck` **passed (exit 0)**. Read-only review — **no code changed.**

## Architecture summary

- **Entry points:** `apps/portal-medspa` (Next.js 14 App Router, ~27 routes + API routes), `apps/portal-homeservices` (2nd vertical), `apps/connect-api` (X-API-Key REST), `apps/mcp-server` (JSON-RPC tools wrapping Connect API), `packages/sdk` (typed Connect client).
- **Data flow:** UI → Portal API route / Server Component → `@baseplate/core` data-access → Supabase (Postgres + RLS) and/or Connect API → Stripe / Twilio / Postmark / intelligence rules-engine.
- **Boundaries:** `@baseplate/core` owns auth/RBAC/audit/encryption/persistence; `packages/ui` owns shared primitives; `packages/integrations/*` own external services; RLS owns row-level tenant isolation.
- **The single biggest architectural risk** runs through everything below: **the Connect API tenant boundary is one shared global API key plus a client-supplied `clinic_id`**, and **several `'use client'` components call core Supabase data-access directly in the browser.** Both bypass the otherwise-solid RLS model.

## Summary — 41 consolidated findings

| Severity | Count | Headline |
|----------|-------|----------|
| **Critical** | 5 | Connect API cross-tenant IDOR (shared key + body clinic_id); two unauthenticated portal proxy routes; `payments` table referenced but never created; marketplace install/uninstall broken AND unauthenticated |
| **High** | 13 | Client-side Supabase data-access leak; no Stripe webhook idempotency; RLS identity drift (0014/0015); no-op "tighten RLS" (0007); swallowed compliance audit writes; unthrottled signup/intake; fail-open rate limiter |
| **Medium** | 17 | `getSession()` vs `getUser()`; patient-create race; room double-book; expired-package deduction; perf (select \*, missing indexes, unbounded lists); money type drift; missing ON DELETE / FKs; `ui` focus/aria gaps; homeservices fake signup; silent feedback/install failures; reflected error internals |
| **Low / nit** | 6 | Missing correlation ids; `console.log` on a hot path; SDK/MCP param drift; loading/disabled gaps; `as unknown as` cast |

---

## CRITICAL

### C1 — Connect API tenant boundary is one shared key + client-supplied `clinic_id` (cross-tenant IDOR by design)
`apps/connect-api/src/lib/auth.ts:13-14` — a single global `CONNECT_API_KEY`, compared with plain `!==` (not constant-time), no per-clinic identity, no rotation. Every `/api/v1/*` endpoint then trusts `clinic_id`/`tenant_id` from the **request body**:
- `reporting/treatment-metrics/route.ts:55-58` — any key holder reads any clinic's revenue/appointments.
- `billing/package-deduct/route.ts:51-57` — any key holder drains any clinic's credit packages; no check that `package_id` belongs to `clinic_id`.
- `intelligence/risk-score/route.ts:39,47` and `churn-prediction` — cross-tenant patient scoring.
- `marketplace/install/route.ts:41,74` — any key holder mutates any clinic's module subscriptions.
- MCP tools (`apps/mcp-server/src/tools/*`) forward caller-supplied key + clinic_id, exposing this to external AI agents.

**Fix:** issue **per-clinic API keys** mapped to a `clinic_id` server-side; derive the tenant from the authenticated key, never from the body. Compare keys with `crypto.timingSafeEqual` over hashed buffers. (Flagged by security, authz, contracts.)

### C2 — Two portal proxy routes are completely unauthenticated
- `apps/portal-medspa/src/app/api/intelligence/risk-score/route.ts:4-8` — anonymous POST proxied to Connect risk-scoring (patient data in/out).
- `apps/portal-medspa/src/app/api/marketplace/route.ts:18-29` (POST install) and `:31-42` (DELETE uninstall) — anonymous install/uninstall of paid modules against any `clinic_id`.

Portal middleware matches only `/dashboard/:path*`, so API routes are **not** gated by middleware — each handler must check auth itself, and these don't.
**Fix:** `const ctx = await getUserContext(); if (!ctx) return 401;` then force `clinicId = ctx.clinicId`; ignore any client-supplied clinic id. (authz C1–C3.)

### C3 — `payments` table is referenced but never created
`supabase/migrations/0005_payments.sql` only adds payment **columns to `appointments`**; no migration creates a standalone `payments` table, yet `0012_intelligence_seed.sql:95,106` inserts into `payments(...)` and the intelligence revenue-drop rule queries it.
**Impact:** seed hard-fails (`relation "payments" does not exist`); any revenue-rule path is broken in prod.
**Fix:** add a forward migration creating `payments` (FKs to clinics/patients, explicit `ON DELETE`), then re-run seed. Don't edit applied migrations. (data-integrity H1.)

### C4 — Marketplace install/uninstall is broken at runtime (drops required `clinic_id`)
Connect requires `clinic_id` + `module_id` (`marketplace/install/route.ts:12-15,63-68`), but the portal proxy (`api/marketplace/route.ts:18-35`) forwards the raw browser body and `components/marketplace-browser.tsx:66-82` sends only `{ module_id }`. **Every install/uninstall returns 400.** Compounded by C2 (the route is also unauthenticated) and the UI assuming success (E-class below). Browse response shape also mismatches (`{ modules }` vs `{ installed }`), so installed modules always show an "Install" button.
**Fix:** inject session `clinic_id` in the proxy; align browse/installed response contract. (contracts H1–H3.)

### C5 — `'use client'` components run Supabase data-access directly in the browser
`StaffCalendar.tsx`, `PatientList.tsx`, `ProviderManager.tsx`, `RoomManager.tsx`, `AuditLogViewer.tsx`, `FormBuilder.tsx` import data-access fns from the **full `@baseplate/core` barrel** and call them in `useEffect`. This (a) ships `@supabase/supabase-js` + `stripe` + all core modules into first-load JS, and (b) executes raw `.from(...)` queries client-side under the anon key. RLS still applies, so it's not an immediate data breach — but it is the wrong trust boundary, bundles server code, and is one refactor away from leaking the service-role client.
**Fix:** move data access to Server Components / API routes; pass plain data as props; client imports **types only**. Split the `core` barrel so types have a client-safe entry. (client-bundle H1–H7, perf H1.)

---

## HIGH

- **H1 — No Stripe webhook idempotency.** `app/api/webhooks/stripe/route.ts:34-42` does a bare `subscriptions.insert` on `customer.subscription.created`; Stripe redelivers events → duplicate rows, and the unique constraint on `stripe_subscription_id` turns redelivery into a 400 → **infinite retry storm**. No `processed_events` table anywhere. **Fix:** `processed_events(event_id PK)` guard + `upsert(onConflict: 'stripe_subscription_id')`. (data-integrity, concurrency, error-boundaries, observability all flagged.)
- **H2 — Payment status can regress `completed → failed`.** `packages/core/src/scheduling/appointments.ts:100-120` blindly writes whatever status arrives; an out-of-order late `payment_failed` flips a paid appointment back and nulls `payment_completed_at`. **Fix:** guard with `.eq('payment_status','pending')` / state machine.
- **H3 — RLS identity-column drift reintroduces a fixed bug.** `0014_subscriptions.sql:26`, `0015_feedback.sql:24,30` scope by `staff.id = auth.uid()` instead of the canonical `clinics.owner_id = auth.uid()` ∪ `staff.email = auth.email()`. Clinic owners with no staff row are **locked out of billing/feedback** (silent zero rows). Migration 0011 already fixed this exact pattern. **Fix:** forward migration restoring the canonical policy.
- **H4 — "Tighten RLS" insert policies are no-ops.** `0007_tighten_rls_policies.sql:8-24` checks `clinic_id IN (SELECT id FROM clinics)` — i.e. "any existing clinic." Anonymous callers can still insert appointments/intake into **any** clinic. **Fix:** scope to a per-clinic booking token / public-booking flag, or move behind a validating service-role API.
- **H5 — Compliance audit writes swallowed.** `logAction(...).catch(() => {})` on SMS (`sms-reminder/route.ts:68`), billing (`package-deduct/route.ts:65`), reporting (`treatment-metrics/route.ts:129`). For a HIPAA-posture app the audit trail can vanish with zero trace. **Fix:** `.catch(err => logError(err, {op}))` — never an empty catch.
- **H6 — Unauthenticated, unthrottled signup.** `api/auth/signup-enhanced/route.ts:15` creates auth user + clinic + staff on every anonymous POST, no rate limit / CAPTCHA → mass account/clinic creation; raw `authError.message` (`:41`) enables email enumeration; clinic/staff insert errors are unchecked (`:46-62`) → orphaned accounts with no log. **Fix:** per-IP/email rate limit + bot protection; generic errors; transactional cleanup.
- **H7 — Public intake uses service-role client + body `clinic_id`, unthrottled.** `api/intake/submit/route.ts:16,34` writes patient/intake (PHI-adjacent) rows via the RLS-bypassing service client trusting a client-supplied clinic id. **Fix:** rate-limit + signed/scoped intake token.
- **H8 — Rate limiter fails open.** `apps/connect-api/src/lib/rate-limit.ts:25` returns `{ success: true }` when `UPSTASH_*` env is missing → zero limiting, no alert. Rate-limit key is also the **raw API key** (`sms-reminder/route.ts:29`), writing the secret into Redis. **Fix:** fail closed in prod; key on a hash.
- **H9 — Outbound SMS to client-supplied number, no per-key cap.** `sms-reminder/route.ts:58` sends to `patient_phone` from the body under only a global 100/min limit → SMS-pumping/toll fraud. **Fix:** per-key SMS quota; validate destination against known patient records.
- **H10 — Patient find-or-create race / duplicate rows.** `packages/core/src/patients/index.ts:18-46` does SELECT-then-INSERT with no unique constraint; concurrent bookings create duplicate patients. **Fix:** `UNIQUE(clinic_id, lower(email))` + `INSERT ... ON CONFLICT DO UPDATE`. (Also a missing-index perf hot path — see M-perf.)
- **H11 — Room double-booking allowed.** `0004_scheduling.sql:37-41` GIST exclusion covers `provider_id` only; two appointments can share a room/time. **Fix:** add a `room_id` exclusion constraint + handle `23P01` for rooms in `createAppointment`.
- **H12 — Payment-link IDOR on appointment/patient.** `api/payments/create-link/route.ts:40-41` verifies `clinicId === ctx.clinicId` but trusts `appointmentId`/`patientId` from the body without ownership check → attach a payment link to another clinic's appointment. **Fix:** load the appointment and assert `appointment.clinic_id === ctx.clinicId`.
- **H13 — homeservices signup is a fake no-op + portal has no error boundaries.** `portal-homeservices/src/app/auth/signup/page.tsx:12-15` unconditionally `router.push('/dashboard')` — drops all input, fakes success; the app has **no `error.tsx`/`global-error.tsx`** anywhere. **Fix:** wire real signup (mirror medspa) or gate as "coming soon"; copy the medspa error-boundary convention.

---

## MEDIUM (grouped)

**Auth/session**
- M1 — `getSession()` used for auth decisions in `middleware.ts:27` and `lib/supabase/server.ts:41`; reads the cookie without revalidating the JWT. **Use `getUser()`** for gating. (security, authz, data-integrity.)
- M2 — `booking/confirm/route.ts:36-41` (public) uses service-role + body `clinicId`/`providerId` with no check that the provider belongs to the clinic. **Verify `provider.clinic_id`.**

**Data integrity / money**
- M3 — Money types diverge: `appointments.amount` / `credit_packages.amount_paid` are `NUMERIC(10,2)` (dollars) while marketplace + Stripe use integer cents; `Math.round(amount*100)` is a rounding-drift surface. **Standardize on integer cents at rest** or centralize one conversion helper.
- M4 — `deduct_package_session` RPC (`0011`) ignores `expires_at` → expired credits still deductible. **Add `AND (expires_at IS NULL OR expires_at > now())`.**
- M5 — Pervasive missing `ON DELETE` / FKs: `appointments.{patient,provider,room}_id` (`0004:26-28`), `intake_submissions.appointment_id` (no FK at all, `0003:17`), `package_transactions.appointment_id` (`0009`), `marketplace_*` FK-less UUIDs (`0013:11,39`), `api_usage.clinic_id ON DELETE SET NULL` (`0010:6`). Deletes either fail or orphan children. **Decide per-relation policy in a forward migration.**
- M6 — Clinic delete orphans **live Stripe resources** (`0014` cascades the DB row but the Stripe subscription/customer keep billing). **Cancel Stripe side-effects on delete.**
- M7 — Seed cleanup references a non-existent `is_synthetic` column (`0012` header) and `gen_random_uuid()` rows can't be cleaned by prefix. **Add `is_synthetic` or fix the cleanup contract.**

**Performance**
- M8 — `getDashboardMetrics` (`packages/core/src/reporting/index.ts:31`) does `select('*')` over all appointments then aggregates in JS. **Push to SQL (COUNT/SUM FILTER, GROUP BY).**
- M9 — Missing indexes: `appointments(clinic_id, scheduled_time)`, `appointments(payment_status)`, `patients(clinic_id, email)` (booking hot path), `payments(clinic_id, created_at)`. **Add them.**
- M10 — Unbounded list fetches: `feedback/route.ts:66`, `getPatients`, `getAppointments` (no from/to) — no `.limit`/pagination; feedback/patients lists also unvirtualized. **Paginate + window.**
- M11 — `StaffCalendar` room-conflict calc is O(n²) over appointments (`StaffCalendar.tsx:86-103`). **Sort + sweep-line → O(n log n); pre-parse times.**

**Frontend correctness / UX**
- M12 — Marketplace install/uninstall is **optimistic with no rollback and ignores `res.ok`** (`marketplace-browser.tsx:63-93`) → UI shows installed when server rejected (bypasses paid-module path). **Check `res.ok`, snapshot+restore on failure.**
- M13 — Feedback widget swallows all failures silently (`FeedbackWidget.tsx:72-95`); RiskPanel vs list views use inconsistent error UI. **Add error state; align presentation.**
- M14 — Post-booking notification call wrapped in `try {} catch {}` with misleading "you'll receive a confirmation" copy even on failure (`BookingForm.tsx:101-133`); `appointments/confirm` returns a `sent` signal that no caller reads. **Surface partial-failure; persist a retry record.**
- M15 — Submit/disabled gaps: billing "Manage Subscription" (`settings/billing/page.tsx:49-59`), StaffCalendar per-row "Cancel" (`StaffCalendar.tsx:183`), BookingForm provider-load has no loading state. **Add pending/disabled state.**

**Accessibility (systemic in `packages/ui` → propagates everywhere)**
- M16 — `Button` (`packages/ui/src/button.tsx:14`) has **no focus-visible ring**. *(auto-fixable)*
- M17 — `Modal` (`packages/ui/src/modal.tsx`) has no focus trap / initial focus / Esc / focus restore / `role="dialog"`; same for the hand-rolled `FeedbackWidget` dialog.
- M18 — No `aria-invalid` / `aria-describedby` anywhere; `Input`/`Form` error messages aren't associated → silent to screen readers (incl. patient intake). `AuditLogViewer` label missing `htmlFor` *(auto-fixable)*. `Input` id derives from `name` and can collide/undefined → use `useId()`.

**Security hygiene**
- M19 — Internal `err.message` reflected to clients (`intake/submit:43`, `webhooks/stripe:54`, `sms-reminder:81`) leaks DB/Stripe/Twilio internals. **Generic client message; log detail server-side.**

---

## LOW / NIT

- L1 — No correlation id threaded through the Stripe webhook (`event.id`) or Connect API requests; reconstructing an incident relies on timestamps. (observability M5–M6.)
- L2 — `console.log` on the churn-prediction hot path (`churn-prediction/route.ts:60`) bypasses the structured logger. *(auto-fixable)*
- L3 — Email send path (`packages/integrations/postmark`) has no log/audit on success or failure.
- L4 — SDK/MCP param drift from Connect zod schemas (missing `appointment_id`, `page`/`page_size`, untyped churn response). Consider generating the SDK from the zod schemas. (contracts M6–L10.)
- L5 — `marketplace/registry.ts` uses `as unknown as MarketplaceModule[]`, hiding camelCase-vs-snake_case type drift. **Map rows or fix the type; drop the cast.**
- L6 — No route-level `loading.tsx` and no `aria-busy` on any list region (consistent gap, not an inconsistency).

---

## Recommended remediation order

1. **Tenant-isolation blockers (C1, C2, C4, H12, H4):** per-clinic Connect keys + derive tenant from the key; add auth to the two open proxy routes; fix marketplace `clinic_id` wiring; ownership checks on payment-link/booking. *Nothing else matters if any tenant can read another's data.*
2. **Data-loss / money blockers (C3, H1, H2, H3, M4, M5/M6):** create `payments`; webhook idempotency; payment-status guard; restore RLS identity policy; expired-package + ON DELETE/Stripe-cleanup migrations.
3. **Architecture (C5):** split the `core` barrel; move client data-access to Server Components / API routes.
4. **Hardening (H5–H11, M1–M3, M19):** swallowed-audit logs, signup/intake throttling, fail-closed limiter, SMS caps, `getUser()`, patient/room uniqueness, money typing, error redaction.
5. **Perf (M8–M11)** then **UX/a11y (M12–M18)** — start with the auto-fixable `ui` primitives (Button focus ring, label `htmlFor`) since they propagate.
6. **Nits (L1–L6).**

**Suggested follow-up skills:** `add-migration` (DB fixes in safe phases), `harden-types` (drop the `as unknown as` cast + boundary validation), `add-empty-error-states` / `add-skeleton-loaders` (homeservices + dashboard surfaces), `audit-authz` re-run after the Connect key change.
