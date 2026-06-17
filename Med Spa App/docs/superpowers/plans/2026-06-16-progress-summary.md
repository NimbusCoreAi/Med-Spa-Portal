# Progress Summary — Security & Tech-Debt Remediation

**Plan:** [`2026-06-16-security-and-tech-debt-fixes.md`](./2026-06-16-security-and-tech-debt-fixes.md)
**Scope:** 41 audit findings (`CODE_REVIEW.md`) → 35 tasks across 11 phases
**Last verified:** 2026-06-16 — `pnpm typecheck` 0 errors (17/17 packages), `pnpm test` 0 failures (261 tests, 17/17 packages)
**Status:** Phases 1–5 **code-complete and verified-green in working tree** — _committed work is 0 of ~35 planned commits_

---

## COMPLETED — code written (Phases 1–5), uncommitted

### Phase 1 — Tenant Isolation (CRITICAL)
- ✅ **Per-clinic API keys:** SHA-256 hash lookup against new `clinic_api_keys` table (migration `0016`);
  all 7 Connect v1 routes derive `clinicId` from the authenticated key, never from the request body.
  (`apps/connect-api/src/lib/auth.ts`, `auth.test.ts`, + 7 `api/v1/*` routes)
- ✅ **Portal proxy routes authenticated:** `intelligence/risk-score` and `marketplace` (GET/POST/DELETE)
  now require `getUserContext()`.
- ✅ **Payment-link IDOR:** `payments/create-link` loads the appointment and asserts clinic + patient ownership.

### Phase 2 — DB Safety
- ✅ `payments` table (mig `0017`)
- ✅ Stripe webhook idempotency via `processed_stripe_events` (mig `0018`)
- ✅ Payment-status no-regression guard (`.neq('payment_status', 'completed')`) in `updateAppointmentPaymentStatus`
- ✅ RLS identity drift fix for `subscriptions` + `feedback` (mig `0019`, restores canonical `owner_id OR staff.email`)
- ✅ Atomic patient upsert + `unique(clinic_id, lower(email))` (mig `0020`)
- ✅ Room exclusion constraint via GiST (mig `0021`)
- ✅ ON DELETE behaviors + missing FKs (mig `0022`)
- ✅ Expired-package guard in `deduct_package_session` RPC (mig `0023`)

### Phase 3 — Security Hardening
- ✅ Rate limiter fail-closed in prod + hashed key before Redis storage
- ✅ Signup: per-IP rate limit, generic error messages (no email enumeration), compensating rollback on partial failure
- ✅ Intake: rate-limited, clinic verified before service-role writes, errors redacted

### Phase 4 — Compliance Logging
- ✅ 3 swallowed audit `.catch(() => {})` → `logError(...)` (SMS, billing, reporting)
- ✅ `console.log` → structured `logInfo` on churn-prediction hot path
- ✅ Request-id correlation IDs threaded through Connect API routes

### Phase 5 — Auth Fixes
- ✅ Middleware `getSession()` → `getUser()` (revalidates JWT)
- ✅ Expired-package guard RPC (mig `0023`)
- ✅ Marketplace types standardized to snake_case (`packages/marketplace/src/types.ts`)
- ✅ **`as unknown as` cast removed** in `registry.ts:139` (Task 21 marketplace portion — _done_, despite stale notes to the contrary)

---

## Verification (2026-06-16) — ✅ ALL GREEN
- **`pnpm typecheck`:** 17/17 packages pass, **0 errors**
- **`pnpm test`:** 17/17 packages pass, **261 tests, 0 failures**
  - `@baseplate/core` 148/148 · `connect-api` 12/12 · `@baseplate/ui` 25/25 (100% coverage)
  - `@baseplate/intelligence` 25/25 · `@baseplate/patterns` 23/23 · `@baseplate/stripe` 6/6
  - `@baseplate/postmark` 5/5 · `@baseplate/twilio` 4/4 · `@baseplate/dates` 13/13

### Issues found & fixed during verification
| Issue | Root cause | Fix |
|-------|-----------|-----|
| `marketplace/install/route.ts:49` typecheck error | `activatedAt` (camelCase) left over from snake_case rename | → `activated_at` |
| `signup-enhanced/route.ts:86` typecheck error | `.delete().eq().catch()` — PostgrestFilterBuilder has no `.catch()` | → `try { await ... } catch {}` |
| `create-link/route.ts:5` typecheck error | imported `getServiceSupabaseClient` (doesn't exist) | → `createServerSupabaseClient` |
| `PatientList.tsx:19` + `StaffCalendar.tsx:73` typecheck errors | `getPatients` return type changed from `Patient[]` to `{patients, total}` | → `.patients` unpacking |
| `patients.test.ts` — 5 failures | Stale mocks: new `.upsert()` / `.range()` chains + changed error msg + `{patients,total}` return | Rewrote 5 test mocks to match new query chains |
| `scheduling.test.ts` — 3 failures | Stale mocks: new `.neq('payment_status','completed')` no-regression guard | Added `.neq()` to 3 mock chains + assertion |

## Changed files (working tree)
- **8 new migrations:** `0016`–`0023` (in `supabase/migrations/`)
- **Connect API:** 7 v1 routes + `lib/auth.ts`, `lib/__tests__/auth.test.ts`, `lib/rate-limit.ts`
- **portal-medspa:** `signup-enhanced`, `intake/submit`, `intelligence/risk-score`, `marketplace`, `payments/create-link`, `webhooks/stripe`, `middleware.ts`, + new `lib/request-rate-limit.ts`
- **packages/core:** `patients/index.ts`, `scheduling/appointments.ts`
- **packages/marketplace:** `registry.ts`, `types.ts`
- **Docs:** `CODE_REVIEW.md`, `docs/superpowers/` (this plan + the master plan)

Net diff at write time: **+460 / −252 across 21 modified files** (plus the 8 untracked migrations).

---

## PENDING — not started (Phases 6–11)

| Phase | Task | Complexity |
|--------|------|------------|
| 6 | Move 6 client components to API routes (StaffCalendar, PatientList, ProviderManager, RoomManager, AuditLog, FormBuilder); remaining `import type` misses in BookingForm / PaymentPanel / IntakeStatusBadge | HIGH |
| 7 | Migrations `0024`–`0027` (money → cents, seed `is_synthetic` column, dashboard RPC, indexes); paginate feedback + patients | MEDIUM |
| 8 | O(n²) → O(n log n) room-conflict sweep-line in `StaffCalendar` | LOW |
| 9 | FeedbackWidget error UI; booking notification outcome; button disabled states | MEDIUM |
| 10 | Button `focus-visible` ring; Modal focus trap; Input `aria-invalid` / `aria-describedby` | MEDIUM |
| 11 | Homeservices real signup + error boundaries; SDK type completeness (`packages/sdk`) | MEDIUM |

---

## Immediate next steps (in priority order)

1. ~~Run `pnpm typecheck`~~ ✅ **0 errors**
2. ~~Run `pnpm test`~~ ✅ **261 pass, 0 fail**
3. **Commit Phases 1–5** in focused groups (tenant isolation → DB → hardening → logging → auth).
   The master plan has ready-made commit commands for each task.
4. Then proceed to Phase 6+ as desired.

---

## Notes / corrections vs. earlier draft
- The "one last `as unknown as` cast in `registry.ts:139`" item is **already resolved** — a grep across
  `packages/marketplace` finds no `as unknown as`, and `types.ts` is already snake_case with inline comments
  noting the DB-column match. Task 21's marketplace portion is complete; only its client-component
  `import type` fixes (Phase 6) remain.
- File count is **8 migrations + 21 modified files**, not "~30 migrations" as the earlier draft stated.
- "~35 commits needed" is accurate — **0 of 35 landed** at write time.
