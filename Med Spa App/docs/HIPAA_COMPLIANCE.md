# HIPAA Compliance Posture

> **Status:** HIPAA-Designed (Not Yet Certified)
> **Phase:** 1 (Build — No Real Patient Data)
> **Last Updated:** June 2026

---

## Current Posture: Free Tier, Non-PHI

Phase 1 operates on **free-tier infrastructure** with **no PHI (Protected Health Information)**
in the intake forms. The architecture is pre-wired for full HIPAA compliance —
upgrading to BAA-backed status is a **configuration change**, not a code rewrite.

### What This Means
- Intake forms collect **administrative data only**: name, contact info, appointment preferences
- **No medical history, diagnoses, medication lists, or treatment-specific health data** is stored
- The `PHI_ENABLED` feature flag (default: `false`) gates whether PHI field types are available
- Safe for staging testing with synthetic data

---

## Already Implemented (HIPAA-Designed)

| Safeguard | Implementation | Location |
|-----------|---------------|----------|
| **Encryption at rest** | TweetNaCl secretbox module (`encryptData`/`decryptData`/`generateKey`) — ready to activate for PHI fields | `packages/core/src/encryption/` |
| **Encryption in transit** | HTTPS/TLS via Vercel (automatic) | Infrastructure |
| **Audit logging** | WHO/WHAT/WHEN/FROM for all actions, immutable | `packages/core/src/audit-logs/` |
| **Access control (RBAC)** | Owner/Staff/Patient role enforcement on every route + API | `packages/core/src/rbac/`, `middleware.ts` |
| **Row Level Security** | PostgreSQL RLS on all tables (clinic-scoped policies) | `supabase/migrations/0002_rls_policies.sql`, `0007_tighten_rls_policies.sql` |
| **Consent tracking** | Digital signature with timestamp, IP, user agent | `packages/patterns/src/digital-signature/`, `packages/patterns/src/consent-form/` |
| **Double-booking prevention** | GIST exclusion constraint at DB level | `supabase/migrations/0004_scheduling.sql` |
| **Input validation** | Zod schema validation on every API route | All `apps/portal-medspa/src/app/api/*/route.ts` |
| **XSS prevention** | HTML escaping in email templates | `packages/integrations/postmark/src/index.ts` |
| **IDOR prevention** | API routes verify `clinicId` from session matches request body | All staff-facing API routes |
| **Session-aware auth** | `@supabase/ssr` cookie-based sessions | `apps/portal-medspa/src/lib/supabase/` |

---

## BAA Upgrade Path (Phase 5 — "Flip of a Switch")

When ready to accept real patient data (Phase 5 pilot onboarding):

### Step 1: Supabase Pro + BAA
1. Upgrade Supabase to **Pro** ($25/month)
2. Sign Supabase **Business Associate Agreement** (BAA)
   - Available at: https://supabase.com/docs/guides/security/hipaa
3. No database schema changes needed — RLS already in place

### Step 2: Vercel BAA
1. Sign Vercel **Data Processing Agreement (DPA)** or upgrade to Enterprise
2. Verify all environment variables use production secrets

### Step 3: Activate Encryption for PHI
1. Set `PHI_ENABLED=true` in environment variables
2. The encryption module (`packages/core/src/encryption/`) activates for PHI fields
3. Generate encryption keys via `generateKey()` and store securely (AWS KMS recommended)

### Step 4: Enable PHI Intake Fields
1. Set the `PHI_ENABLED` feature flag to `true` in the config
2. Intake form builder unlocks PHI field types (medical history, medications, allergies)
3. These fields are encrypted at rest before storage

### Step 5: Audit Log Retention
1. Set up PostgreSQL scheduled job to enforce 6-year retention policy
2. Enable Supabase daily backups (Pro plan includes 7-day PITR)

**No code rewrite needed.** All infrastructure is pre-wired.

---

## What's NOT Yet Implemented (Deferred)

| Item | Phase | Notes |
|------|-------|-------|
| Signed BAA with Supabase | Phase 5 | Required before real PHI |
| Signed DPA with Vercel | Phase 5 | Required before real PHI |
| AWS KMS key management | Phase 5 | For production encryption keys |
| Penetration testing | Phase 5+ | Before scaling beyond pilots |
| HIPAA compliance certification | Phase 5+ | Formal audit |
| Disaster recovery testing | Phase 5+ | Backup restore verification |
| Breach notification procedure | Phase 5 | Document incident response |

---

## Compliance Checklist (Phase 1 Self-Assessment)

- [x] Encryption module exists and is tested
- [x] Audit logging captures all user actions
- [x] RBAC enforced on every route and API endpoint
- [x] RLS policies on every database table
- [x] Digital consent capture with timestamps
- [x] Input validation on all API routes (Zod)
- [x] IDOR prevention (clinic-scoping on API routes)
- [x] XSS prevention in email templates
- [x] HTTPS/TLS in transit
- [x] Session-aware authentication
- [ ] Signed BAA with infrastructure providers (Phase 5)
- [ ] PHI field encryption activated (Phase 5)
- [ ] 6-year audit log retention policy (Phase 5)
- [ ] Penetration testing (Phase 5+)

---

## References

- [Supabase HIPAA Guide](https://supabase.com/docs/guides/security/hipaa)
- [HIPAA Compliance Checklist](https://www.hipaajournal.com/hipaa-compliance-checklist/)
- [HHS HIPAA for Professionals](https://www.hhs.gov/hipaa/for-professionals/index.html)
