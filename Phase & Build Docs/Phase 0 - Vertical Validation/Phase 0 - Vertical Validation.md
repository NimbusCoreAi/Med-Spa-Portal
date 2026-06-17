# Phase 0: Vertical Validation (COMPLETE)
## Med Spas / Wellness Clinics — VALIDATED ✅

**Status:** Gate PASSED  
**Date Started:** June 2026  
**Date Completed:** June 2026  
**Vertical Chosen:** Med Spas / Wellness Clinics  

> Extracted from `Business Plan & Roadmap.md`, Section 8. Updated with comprehensive market research and validation from actual clinic owners.

---

## Executive Summary

**Decision:** PROCEED TO PHASE 1  
**Rationale:** 3+ clinic owners validated critical pain points mapping directly to Baseplate Scaffold modules. Market research confirms 7 additional pain points creating $500-2K/month revenue opportunity per clinic.

### Vertical Selection: Med Spas ✅

| Criteria | Score | Notes |
|---|---|---|
| Integration complexity | High | Booking + Payments + HIPAA photo storage + SMS = real moat |
| Compliance friction | **CRITICAL** | HIPAA liability is non-negotiable; clinic owners nervous about photo storage |
| Willingness to pay | $150-$300/mo (validated) | Higher for HIPAA-compliant integrated solutions |
| Market size | 10K-42K businesses | $385M TAM → $1.5B by 2035 |
| Growth rate | 14.4% CAGR | Fastest among all verticals researched |
| Reachability | ✅ Excellent | Warm intros available; local concentration in metro areas |
| Existing tool pain | **ACUTE** | Mindbody + Square + Google Drive fragmentation confirmed by all contacts |

**Why Med Spas Over Other Tier 1 Candidates:**
- **Home Services (HVAC/Plumbing):** Close second; QB gap is real. Better as Phase 3+ once pattern proven.
- **Contractors:** Larger market but more workflow complexity; slower Phase 1 execution.

---

## Gate to Proceed to Phase 1: ✅ PASSED

**Threshold:** At least 2 owners describe a pain point that maps directly to a Scaffold module.

**Evidence:**
- ✅ 3+ clinic owners contacted
- ✅ All described tool fragmentation (Mindbody + Square + Google Drive) = Client Management + Payments + Audit Logs mapping
- ✅ All expressed HIPAA compliance anxiety = Auth/RBAC + Audit Logs + Photo Storage mapping
- ✅ All mentioned intake follow-up forgotten = Notifications + Client Management mapping
- ✅ All mentioned payment reconciliation issues = Payments + Reporting mapping

**Additional Validation:**
- ✅ No-show rates (15-25%) and SMS reduction (20-25%) quantified in market research
- ✅ 7 new pain points discovered that aren't in existing solutions
- ✅ Competitor analysis shows gaps across all major platforms
- ✅ Revenue recovery opportunity quantified ($500-2K/month per clinic)

**Result:** PROCEED TO PHASE 1 WITH CONFIDENCE

---

## SECTION 1: VALIDATED PAIN POINTS & SCAFFOLD MODULE MAPPING

### Initial Research Validation ✅

From clinic owner conversations and market research:

| Pain Point | Severity | Clinic Owner Quote | Scaffold Modules | Phase 1 Priority |
|---|---|---|---|---|
| **Tool Fragmentation** | CRITICAL | "Patients book Mindbody, payments in Square, intake in Google Drive" | Client Management, Payments, Audit Logs | Phase 1A |
| **HIPAA Compliance Anxiety** | CRITICAL | "HIPAA audits make me nervous about scattered data" | Auth/RBAC, Audit Logs, Encryption | Phase 1A |
| **Forgotten Intake Follow-ups** | HIGH | "We forget to follow up on intakes, patients show up unprepared" | Notifications, Client Management | Phase 1A |
| **Payment-Intake Mismatch** | HIGH | "Payments don't match intakes; no visibility" | Payments, Reporting, Audit Logs | Phase 1B |
| **No-show Prevention** | HIGH | "15-25% no-show rate costs us $500-2K/month" | Notifications, SMS, Scheduling | Phase 1B |

**Status:** All 5 pain points confirmed by multiple clinic owners.

---

### New Pain Points from Market Research (Web Search)

Research discovered 7 critical pain points not mentioned in initial validation but present in market:

#### Pain Point 1: Before/After Photo HIPAA Violation ⚠️
**Severity:** CRITICAL (Legal Liability)  
**Why It Matters:** Photos linked to patient = PHI. All major platforms (Mindbody, Vagaro, Zenoti) store insecurely.  
**Market Impact:** #1 HIPAA violation for med spas; potential fines $100-50K per violation.  
**Scaffold Modules Required:**
- `Auth/RBAC` — Role-based access control for photo viewing
- `Encryption` — End-to-end encryption for photo storage
- `Audit Logs` — Track who accessed which photos, when
- `HIPAA Compliance Layer` — BAA-covered infrastructure, explicit consent workflows

**Phase 1 Implementation:** HIPAA-compliant photo storage with audit trails + digital consent forms

---

#### Pain Point 2: Injectable Treatment Charting Gap ⚠️
**Severity:** HIGH  
**Why It Matters:** Heavy injectors can't document injectables properly; fall back to paper charts.  
**Market Impact:** Clinics lose clinical depth + compliance documentation; can't track efficacy.  
**Scaffold Modules Required:**
- `Client Management` — Patient intake + medical history
- `Treatment Planning` — Injectable charting templates (Botox, filler, Kybella)
- `Face Mapping` — Digital diagrams for injection site documentation
- `Audit Logs` — Track treatment history per patient

**Phase 1 Implementation:** Pre-built templates for common injectables; face diagram + units tracking

---

#### Pain Point 3: Inventory-Charting Disconnect ⚠️
**Severity:** HIGH  
**Why It Matters:** Injectables not auto-deducted from inventory when treatment charted; waste of $5-10K/year per clinic.  
**Market Impact:** Manual tracking + expired products + overstock/understock.  
**Scaffold Modules Required:**
- `Inventory Management` — Track injectables by lot number + expiration
- `Integration Layer` — Auto-deduct inventory when treatment charted
- `Alerts` — Expiration warnings, reorder triggers
- `Reporting` — Usage analytics per provider, per treatment type

**Phase 1 Implementation:** Basic tracking; Phase 2 becomes `POST /v1/inventory/deduct` Connect endpoint

---

#### Pain Point 4: Double-Booking & Room Conflicts ⚠️
**Severity:** HIGH  
**Why It Matters:** Provider + room + equipment need to book simultaneously; conflicts erode trust + revenue.  
**Market Impact:** $200-500 lost revenue per double-booking; staff burnout.  
**Scaffold Modules Required:**
- `Scheduling` — Real-time room + provider calendar
- `Conflict Detection` — Prevent overlapping bookings at entry (not after-the-fact)
- `Audit Logs` — Track all scheduling changes

**Phase 1 Implementation:** Real-time scheduling with provider + room assignment; conflict prevention

---

#### Pain Point 5: Marketing Automation Disconnected from Clinical Data ⚠️
**Severity:** MEDIUM-HIGH  
**Why It Matters:** Can't send personalized follow-ups based on treatment type (e.g., "Botox peaks at 2 weeks").  
**Market Impact:** SMS reminders reduce no-shows 20-25%; personalized ones reduce more.  
**Scaffold Modules Required:**
- `Notifications` — SMS/email reminders
- `Workflow Automation` — Trigger messages based on treatment + time-to-peak
- `Patient Segmentation` — Send different messages based on treatment type
- `Integration Layer` — Connect to Twilio/Postmark

**Phase 1 Implementation:** Automated SMS reminders before appointment + SMS intake completion request

---

#### Pain Point 6: Reporting & Analytics Fragmentation ⚠️
**Severity:** MEDIUM  
**Why It Matters:** Owner can't see revenue per provider; office manager can't see real-time scheduling; providers can't track performance.  
**Market Impact:** Data-driven decisions impossible; optimization stalled.  
**Scaffold Modules Required:**
- `Reporting` — Dashboards for revenue, no-show rate, intake completion
- `Analytics` — Treatment popularity, provider performance, scheduling efficiency
- `RBAC` — Different views per role (owner, provider, office manager)

**Phase 1 Implementation:** Simple dashboard: revenue, appointments, intake status; Phase 2 adds deep analytics

---

#### Pain Point 7: Billing & Package Management Friction ⚠️
**Severity:** MEDIUM  
**Why It Matters:** Treatment packages (e.g., "3 Botox for $1,200") not auto-deducted; clinics lose $500-2K/month.  
**Market Impact:** Manual tracking + forgotten packages = revenue leakage.  
**Scaffold Modules Required:**
- `Payments` — Package + membership management
- `Integration Layer` — Auto-deduct from package when appointment completed
- `Alerts` — Package expiration warnings
- `Reporting` — Package utilization rate

**Phase 1 Implementation:** Package tracking with manual deduction; Phase 2 becomes `POST /v1/billing/package-deduct` endpoint

---

## SECTION 2: BASEPLATE-CORE MODULES FOR MED SPA VERTICAL

### Module Dependency Map

**Foundation (Required for all verticals):**
- `Auth` — Email/password + magic link authentication
- `RBAC` — Owner / Staff / Patient role separation
- `Audit Logs` — Every write action logged (critical for HIPAA)
- `Encryption` — Data in transit + at rest

**Med Spa Specific (Phase 1 + 2):**
- `Scheduling` — Real-time booking with provider + room conflict detection
- `Patient Intake` — Custom forms with digital signature + consent
- `Treatment Charting` — Injectable-specific templates + face mapping
- `Notifications` — SMS/email reminders + automated workflows
- `Payments` — Invoice generation + payment processing + package tracking
- `Inventory` — Injectable tracking by lot number + expiration
- `Reporting` — Dashboards for revenue, no-shows, intake completion

### Phase 1 vs Phase 2 Breakdown

**Phase 1 — Build:**
- Auth + RBAC + Audit Logs (baseplate-core)
- Scheduling (real-time, conflict prevention)
- Patient Intake (forms + digital consent)
- Treatment Charting (basic injectables)
- Notifications (SMS/email reminders)
- Payments (Stripe invoice generation — feature, not yet API)
- Reporting (simple dashboard)

**Phase 2 — Extract as Connect APIs:**
- `POST /v1/payments/invoice` — Generalized from Stripe integration
- `POST /v1/communications/sms-reminder` — Auto-send SMS reminders
- `POST /v1/inventory/deduct` — Auto-deduct from inventory when treatment charted
- `POST /v1/billing/package-deduct` — Auto-deduct from package balance
- `POST /v1/reporting/treatment-metrics` — Revenue per provider, per treatment type

**Phase 3+ — Intelligence Layer:**
- `POST /v1/intelligence/risk-score` — No-show risk, churn risk, engagement risk
- ML models on treatment efficacy, provider performance, patient lifetime value

---

## SECTION 3: VALIDATION CHECKLIST

**Phase 0 Completion Checklist:**

- [x] Vertical chosen: Med Spas / Wellness Clinics
- [x] 3+ clinic owners contacted and confirmed pain points
- [x] 7 new pain points discovered through web research
- [x] Scaffold modules mapped to each pain point
- [x] Phase 1 + Phase 2 roadmap clarified
- [x] Competitor analysis completed (Mindbody, Vagaro, Zenoti weaknesses documented)
- [x] Market size validated ($385M TAM, 14.4% CAGR, 10K-42K businesses)
- [x] Willingness to pay confirmed ($150-300/mo, higher for HIPAA-compliant)
- [x] Gate threshold met (2+ clinic owners, 5+ pain points validated)

**Ready for Phase 1:** YES ✅

---

## SECTION 4: PHASE 1 KICKOFF CHECKLIST

**Before Phase 1 Week 1 starts:**

- [ ] 3 clinic owners identified as pilot leads (onboarding deferred to Phase 5 — product built first)
- [ ] Monorepo structure initialized (`baseplate-core`, `baseplate-medspa-portal`, shared `ui` package)
- [ ] Tech stack confirmed (Next.js, Postgres/Supabase, Stripe, Postmark, Twilio)
- [ ] Phase 1 specification document written (build roadmap for all phases)

**Resources:**
- See `Phase 1 - The Wedge & First Build.md` for detailed roadmap
- See `Comprehensive Med Spa Market Research.md` for all sources + detailed pain points
- See `Process.md` for Phase 0 execution checklist
