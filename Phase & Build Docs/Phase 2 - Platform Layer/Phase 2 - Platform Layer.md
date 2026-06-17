# Phase 2: Platform Layer Build
## Connect API + Module Generalization + Open-Source Prep

> **🔧 MAINTENANCE:** For current status, see [`../../MASTER_PROGRESS.md`](../../MASTER_PROGRESS.md). After completing any milestone or sub-phase in this phase, update it: (1) "At a Glance" table, (2) check off "What's Left" items, (3) add commit to "Build Log". This is mandatory after every significant commit.

**Status:** Builds on Phase 1 completion
**Vertical:** Med Spas / Wellness Clinics (generalizing for all verticals)
**Goal:** Build Connect API endpoints, generalize all modules, prepare repo for open-source launch in Phase 4

> **Note:** This is a pure build phase — no customer contact. AI-accelerated development
> compresses timelines.

⚠️ **MODULE LIBRARY MANDATE (Phase 2):**
- Generalize all Phase 1 modules — remove vertical-specific code
- Build Connect API endpoints (SMS reminder, package-deduct, treatment-metrics)
- **Exit Gate:** All modules work for ANY vertical + Connect API functional
- **Deliverable:** Open-source-ready `@baseplate/core`, `@baseplate/integrations`, `@baseplate/ui` packages
- See `MODULES_LIBRARY.md` for maturity levels

---

## INHERITANCE FROM PHASE 1

**What Phase 1 delivered:**
- ✅ Complete med spa portal with all features built and tested
- ✅ Module library gaps closed (errors, bookings, availability, hooks, next-api, etc.)
- ✅ RBAC enforced on all routes
- ✅ HIPAA compliance resolved
- ✅ Multi-tenant isolation working
- ✅ Staging deploy + smoke test passed

**What Phase 2 builds from this:** Generalize the proven modules and build Connect API endpoints
to automate the workflows that Phase 0 research identified as pain points.

---

## PHASE 2A: MODULE GENERALIZATION

### Objective
Remove vertical-specific hardcoding from Phase 1 modules. Make `@baseplate/core`, `@baseplate/ui`, and `@baseplate/integrations` work for ANY vertical, not just med spas.

### What You're Doing

**Generalize Core Modules:**
- Remove med spa-specific types (rename `TreatmentType` → `ServiceType`, etc.)
- Make intake form builder configurable for any industry (not just medical history)
- Abstract scheduling to work with any resource type (providers, rooms, equipment, vehicles)
- Ensure RBAC roles are configurable (not hardcoded to owner/staff/patient)

**Generalize UI Components:**
- Remove med spa-specific copy and icons
- Make all components accept configurable labels
- Ensure components work in any Next.js app (not just the med spa portal)

**Repository Prep (open-source launch deferred to Phase 4):**
- Clean up Phase 1 code (remove test data, debug code)
- Write strong README with deployment instructions
- Add architecture diagram
- ⚠️ Do NOT publish to GitHub yet — that's Phase 4

### Success Metric
- All modules work in a fresh Next.js app without med spa-specific dependencies
- `@baseplate/core` exports clean, documented APIs
- Module library passes the "second vertical" test (can it handle a non-med-spa domain?)

---

## PHASE 2B: BUILD THE CONNECT API

### Objective
Extract integrations from Phase 1 portal into reusable, documented APIs.

### What You're Doing

**Identify Top 3 Integration Pain Points from Phase 0 Research:**

Based on typical med spa feedback (from Phase 0 research), priorities are:

1. **`POST /v1/communications/sms-reminder`** (HIGHEST PRIORITY)
   - **Problem:** SMS reminders reduce no-shows 20-25%; currently manual
   - **Solution:** Auto-send SMS 48h before appointment + intake reminder
   - **Built on:** Twilio integration from Phase 1, now extracted as API
   - **Usage:** Clinic configures message template once; API sends automatically
   - **Revenue:** Clinics will pay for automation (saves staff time)

2. **`POST /v1/billing/package-deduct`** (HIGH PRIORITY)
   - **Problem:** Patients buy packages ("3 Botox treatments"); manual deduction loses $500-2K/month per clinic
   - **Solution:** Auto-deduct from package balance when appointment completed
   - **Built on:** Payments module from Phase 1, now tracks packages
   - **Usage:** "When appointment marked complete, auto-deduct from patient's package balance"
   - **Revenue:** Clear ROI ("Recovers $500-2K/month per clinic")

3. **`POST /v1/reporting/treatment-metrics`** (HIGH PRIORITY)
   - **Problem:** No visibility into revenue per provider, per treatment type (Phase 0 pain point #6)
   - **Solution:** API returns: revenue by provider, by treatment, by period
   - **Built on:** Payments + Appointments data from Phase 1
   - **Usage:** Owner dashboard shows "Botox: $5K this month via Provider A, $3K via Provider B"
   - **Revenue:** Clinic owners use this for staffing/pricing decisions

**NOT Building Yet:**
- QuickBooks sync (defer until Phase 5 feedback confirms need)
- Inventory deduction (only for injectable-focused clinics; Phase 3)
- Churn prediction (need 50+ clinics worth of data; Phase 3)

### Architecture: Moving from Portal to APIs

**Phase 1 Setup (Monorepo):**
```
Med Spa App/
  apps/
    portal-medspa/      ← Phase 1 (frontend)
    connect-api/        ← Still in same repo, but now deployable independently
  packages/
    core/               ← Shared modules (Auth, RBAC, etc.)
```

**Phase 2 Extraction:**
```
Extract these features → Standalone Connect API
Portal: Stripe integration → Connect: `POST /v1/payments/invoice`
Portal: Twilio SMS → Connect: `POST /v1/communications/sms-reminder`
Portal: Payments tracking → Connect: `POST /v1/billing/package-deduct`
Portal: Dashboard queries → Connect: `POST /v1/reporting/treatment-metrics`
```

**Result:** Developers can call Connect APIs directly, independent of the portal.

### Implementation Strategy

**Each Connect endpoint:**
- ✅ Documented (OpenAPI spec)
- ✅ Versioned (`/v1/`, `/v2/` later)
- ✅ Free tier (e.g., 100 calls/month for dev/testing)
- ✅ Paid tier (per usage, or monthly subscription)
- ✅ Authentication (API keys from clinic owner account)
- ✅ Logging (every call logged for audit trail)

**Keep Portal Using Connect:**
```javascript
// Portal (apps/portal-medspa/) uses Connect APIs internally
// This proves APIs work before marketing them

// When staff books appointment:
import connectAPI from '@baseplate/connect-sdk';
await connectAPI.postSmsReminder({
  appointmentId,
  patientPhone,
  templateId: 'pre-appointment-reminder'
});

// This call could come from:
// 1. Portal (internal)
// 2. External developer's app (external)
// Same API, same result
```

### Success Metric
- 3 Connect endpoints live + documented (OpenAPI specs)
- 100% uptime in staging tests
- Portal successfully calls Connect APIs internally (proves reliability)
- All endpoints have authentication + audit logging

---

## PHASE 2C: INTEGRATION HARDENING + DOCUMENTATION

### Objective
Harden Connect API for production reliability. Write comprehensive documentation. Prepare pricing structure (for Phase 5 launch).

### What You're Doing

**Integration Hardening:**
- Add rate limiting to all Connect endpoints
- Add comprehensive error handling (transient vs permanent errors)
- Add retry logic for external service failures (Twilio, Stripe, Postmark)
- Add webhook idempotency (prevent duplicate processing)
- Load test all endpoints (verify they handle expected Phase 5 traffic)

**Documentation:**
- Write complete API documentation (OpenAPI/Swagger)
- Create integration guides for developers
- Document authentication flow (API keys, token refresh)
- Create SDK examples (JavaScript, Python)
- Write deployment guide for self-hosting Connect API

**Pricing Structure Prep (launch in Phase 5):**
- Design tier structure:
  ```
  Connect Usage Tiers:
  - Free: 100 API calls/month (dev/testing)
  - Starter: $49/mo (500 calls, 2 integrations)
  - Pro: $99/mo (5,000 calls, 5 integrations)
  - Enterprise: Custom pricing (>10K calls)
  ```
- Configure Stripe subscription products (for Phase 5 activation)
- Build metering infrastructure (track API call counts per account)
- ⚠️ Do NOT launch pricing or contact customers — that's Phase 5

**Cross-Vertical Validation:**
- Test that generalized modules work for at least one non-med-spa domain
- Document what changes between verticals (config, not code)
- Prove the "second vertical" thesis: same core, different config

### Success Metric
- All Connect endpoints load-tested and hardened
- API documentation complete and accurate
- Pricing structure designed (Stripe products created, not activated)
- Module library proven to work across 2+ vertical configurations

---

## CONNECT ENDPOINT CATALOG

### 3 Endpoints Shipping in Phase 2

| Endpoint | Purpose | Built From | Revenue Impact |
|---|---|---|---|
| **`POST /v1/communications/sms-reminder`** | Auto-send SMS 48h before appointment + intake reminder | Twilio from Phase 1 | Reduces no-shows 20-25% = $500-2K/month per clinic |
| **`POST /v1/billing/package-deduct`** | Auto-deduct from package balance when appointment completed | Payments tracking from Phase 1 | Recovers forgotten packages = $500-2K/month per clinic |
| **`POST /v1/reporting/treatment-metrics`** | Revenue by provider, treatment type, period | Dashboard from Phase 1 | Enables pricing/staffing decisions = ROI on portal |

### Future Endpoints (Phase 3+)

From Phase 0 research, these become Phase 3+ priorities:
- `POST /v1/inventory/deduct` — Auto-deduct injectables when treatment charted ($5-10K/year savings)
- `POST /v1/accounting/sync` — Push to QuickBooks (if clinics request)
- `POST /v1/intelligence/risk-score` — Churn risk flags (Phase 3 data layer)

---

## GATE TO PHASE 3

**Threshold:** All modules generalized + Connect API functional + documentation complete

**Actual Criteria (Build-Focused):**
- ✅ All Phase 1 modules generalized (work for ANY vertical)
- ✅ 3 Connect endpoints live, documented, load-tested
- ✅ Connect API authentication + audit logging working
- ✅ API documentation complete (OpenAPI specs, integration guides)
- ✅ Pricing structure designed (Stripe products created, not activated)
- ✅ Module library passes cross-vertical validation test
- ✅ Portal successfully uses Connect APIs internally

**If Missed:**
- Stay in Phase 2
- Don't move to Phase 3 until Connect API is hardened and documented
- Focus on reliability and documentation, not new features

---

## WHAT HAPPENS TO THE PORTAL?

**After Phase 2 (platform layer built):**
- Portal stays in the monorepo (not yet published — open-source launch is Phase 4)
- Portal automatically uses Connect APIs internally (proves reliability)
- Portal serves as the reference implementation for the module library

**After Phase 4 (open-source launch):**
- Portal published to GitHub (free, MIT license)
- Portal is the "store window" for Connect
- Every clinic using portal is a potential Connect customer (Phase 5+)

**You can:**
- Keep portal simple (don't add features just to add features)
- Focus on reliability + HIPAA compliance
- Let developers fork + customize for their own clinics (Phase 4+)
- Capture developers as Connect customers (Phase 5+)

---

## ALIGNMENT TO PHASE 0 RESEARCH

**Pain Points Being Solved:**

| Phase 0 Pain Point | Phase 2 Solution |
|---|---|
| No-show prevention (HIGH) | SMS reminders API |
| Package management friction (MEDIUM) | Package deduction API |
| Reporting gaps (MEDIUM) | Treatment metrics API |
| Inventory waste (HIGH) | [Phase 3] Inventory deduction API |
| QB integration gap (HIGH) | [Phase 3] Accounting sync API |
| Marketing automation disconnect (MEDIUM-HIGH) | [Phase 3] Triggered workflows API |

**Phase 2 focuses on highest-ROI items:** SMS + packages + reporting.

---

## RESOURCES

**Related Documentation:**
- `Phase 0 - Vertical Validation.md` — Pain points + why Med Spas
- `Comprehensive Med Spa Market Research.md` — Competitive analysis + market size
- `Phase 1 - The Wedge & First Build.md` — What Phase 2 builds from
- `Phase 1 - Scaffold Specification.md` — Database + architecture Phase 2 extends
- `Phase 3 - Intel & Ecosystem/Phase 3 - Intel & Ecosystem.md` — What comes after Phase 2

