# Phase 1: Med Spa Portal Specification
## Baseplate Scaffold Template for Medical Spas

> **🔧 MAINTENANCE:** For current status, see [`../../MASTER_PROGRESS.md`](../../MASTER_PROGRESS.md). After completing any milestone or sub-phase, update it: (1) "At a Glance" table, (2) check off "What's Left" items, (3) add commit to "Build Log".

**Phase:** 1 (Pure Build)  
**Status:** Specification (Pre-implementation)  
**Vertical:** Med Spas / Wellness Clinics  
**Tech Stack:** Next.js, React, Postgres (Supabase), Stripe, Postmark, Twilio  

---

## ⚠️ MODULE LIBRARY MANDATE (READ FIRST)

**PRIMARY GOAL:** Build a **reusable module library** for AI agents, not just a med spa portal.

**What This Means:**
- Every component you build goes in ONE of two places:
  - **`apps/portal-medspa/`** — Med spa specific (UI, workflows, forms)
  - **`packages/`** — Reusable (Auth, Payments, Emails, Logging, UI components)

**Target Output (Phase 1 Exit):**
- ✅ 16+ reusable modules in `packages/` (see `MODULES_LIBRARY.md`)
- ✅ Med spa portal in `apps/portal-medspa/` 
- ✅ All modules documented + tested
- ✅ Core modules ready to be open-sourced in Phase 2

**Module Build Schedule (This Specification):**
- **Phase 1A:** Build `core/` modules (auth, rbac, audit-logs, encryption, types, config)
- **Phase 1B:** Build `integrations/` modules (stripe, postmark, twilio) + extract portal features
- **Phase 1C:** Build `ui/` + `patterns/` modules (forms, tables, admin-setup, etc.)

**Checklist During Development:**
- [ ] Before writing any code: Is this reusable across verticals?
- [ ] After building: Extract to `packages/` if yes
- [ ] Each week: Check module extraction checklist (see Section 7)
- [ ] Before deploying: Verify all modules documented + tested

**Why This Matters:**
- Phase 2: Generalize modules → open-source template
- Phase 3: Reuse same modules for 2nd vertical (4 months compressed, not 8)
- Phase 4: Distribute via SDK for AI agents

**See Also:** `MODULES_LIBRARY.md` (complete module inventory + build schedule)

---

## EXECUTIVE SUMMARY

Build a HIPAA-compliant med spa portal that solves 5 critical clinic owner pain points and establishes Baseplate's defensibility through integrated clinical + business workflows.

**What Success Looks Like (Build-Only):**
- 16+ reusable modules in `packages/` (documented + tested)
- Med spa portal functional end-to-end on staging
- HIPAA baseline implemented (encryption, RBAC, audit logs, consent tracking)
- Portal deployed to staging by Phase 1 Exit

**Revenue Opportunity Per Clinic (Phase 2 onward):**
- No-show reduction: $500-2K/month
- Intake completion (better scheduling): $200-500/month
- HIPAA compliance peace-of-mind: $100-200/month
- **Total:** $800-2.7K/month per clinic at $99-199 Connect pricing

---

## SECTION 1: FEATURE SPECIFICATION

### Phase 1A: Core Foundation

#### Week 1: Project Setup + Architecture
**Objective:** Get comfortable with AI-assisted development loop; establish baseline.

**Deliverable:** Throwaway 1-hour challenge dashboard
- Build a simple med spa booking dashboard (Cursor + Claude)
- Document: friction points, surprising wins, build time
- **Goal:** Validate tool (Cursor) and AI workflow before real development

**Tech Setup:**
- Initialize monorepo: `Med Spa App/` with structure:
  ```
  Med Spa App/
    apps/
      portal-medspa/        # Main Scaffold template (Railway)
      connect-api/          # (Empty for now; Phase 2)
    packages/
      core/                 # baseplate-core: shared modules
      ui/                   # Shared component library (Tailwind)
    pnpm-workspace.yaml
    turbo.json
    package.json
  ```
- Set up Supabase project (Auth, DB, Realtime)
- Set up Railway for deployment
- Initialize git + GitHub (private repo)

**Modules in `packages/core` (Start):**
- `auth.ts` — Supabase Auth wrapper (email/password + magic link)
- `types.ts` — Shared TypeScript types (Clinic, Patient, Appointment, etc.)
- `config.ts` — Environment configuration

**UI Components in `packages/ui` (Start):**
- Button, Input, Form, Modal, Table, Card (Tailwind-based)
- These will be used across all pages

---

#### Week 2: Auth Module + RBAC
**Objective:** Establish authentication + role-based access control (foundation for HIPAA).

**Deliverable:** Login system + basic RBAC

**Features:**
- [ ] **Sign-up flow:**
  - Clinic owner creates account with email + password
  - Email verification (Supabase)
  - Clinic setup wizard (name, location, phone, number of providers)

- [ ] **Login flow:**
  - Email + password
  - Magic link option (for staff)
  - Session management (Supabase)

- [ ] **Role separation:**
  - `owner` — Access to all data, settings, reporting
  - `staff` — Access to their own schedule, patient records, messaging
  - `patient` — Access only to their own intake, appointments, consent forms
  - RBAC enforcement on all endpoints

- [ ] **Audit logging (Critical for HIPAA):**
  - Log every login, logout, data access, form submission
  - Track: WHO, WHAT, WHEN, FROM WHERE
  - Store in DB; expose to owner in compliance dashboard (Phase 2)

**Database Schema (Postgres via Supabase):**

```sql
-- Users (via Supabase Auth + custom metadata)
-- Clinics
CREATE TABLE clinics (
  id UUID PRIMARY KEY,
  name VARCHAR(255),
  location VARCHAR(255),
  phone VARCHAR(20),
  num_providers INT,
  created_at TIMESTAMP,
  owner_id UUID REFERENCES auth.users(id)
);

-- Staff
CREATE TABLE staff (
  id UUID PRIMARY KEY,
  clinic_id UUID REFERENCES clinics(id),
  name VARCHAR(255),
  email VARCHAR(255),
  role VARCHAR(50), -- 'owner', 'staff'
  created_at TIMESTAMP
);

-- Audit Logs
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY,
  clinic_id UUID REFERENCES clinics(id),
  user_id UUID REFERENCES auth.users(id),
  action VARCHAR(100), -- 'login', 'create_patient', 'view_photo', etc.
  resource_type VARCHAR(50), -- 'patient', 'appointment', etc.
  resource_id UUID,
  timestamp TIMESTAMP,
  ip_address VARCHAR(50),
  user_agent TEXT
);
```

**Modules in `packages/core`:**
- `auth/useAuth.ts` — React hook for auth state
- `auth/withAuth.ts` — HOC for route protection
- `rbac/getRolePermissions.ts` — Permission checker
- `audit/logAction.ts` — Audit logging utility
- `types.ts` — Update with User, Role, AuditLog types

**Pages in `apps/portal-medspa`:**
- `/auth/signup` — Sign-up + clinic setup
- `/auth/login` — Login + magic link
- `/dashboard` — Protected landing (shows different views by role)

---

#### Weeks 3-4: Patient Intake Module
**Objective:** Build HIPAA-compliant intake form system (solves: tool fragmentation + compliance + forgotten intakes).

**Deliverable:** Digital patient intake forms with consent + signature

**Features:**
- [ ] **Intake form builder (Admin/Owner only):**
  - Pre-built templates for med spas (medical history, allergies, current medications, treatment goals)
  - Customizable fields (clinic can add custom questions)
  - Save form templates per clinic

- [ ] **Patient intake portal (Patient-facing):**
  - Patient receives link (via email/SMS) to complete intake
  - Fill out medical history, allergies, current medications, treatment consent
  - Digital signature field (using Supabase or third-party for compliance)
  - **Do not ask for before/after photos here** (photos stored separately in HIPAA-compliant layer — Phase 2)
  - Clear indication: "Your data is HIPAA-protected. See our privacy policy."
  - Submission confirmation + timestamp

- [ ] **Intake status tracking (Staff view):**
  - Staff dashboard shows: Upcoming appointments + intake completion status
  - Color-coded: Red (not started), Yellow (in progress), Green (completed)
  - **Reminder SMS/email integration (Phase 2)** — For now, staff manually reminds

- [ ] **Intake review (Staff):**
  - Staff can view completed intakes before appointment
  - Edit capability (if patient missed something)
  - Link to appointment details

**Database Schema:**

```sql
-- Patients
CREATE TABLE patients (
  id UUID PRIMARY KEY,
  clinic_id UUID REFERENCES clinics(id),
  email VARCHAR(255),
  phone VARCHAR(20),
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  created_at TIMESTAMP
);

-- Intake Forms (Templates)
CREATE TABLE intake_forms (
  id UUID PRIMARY KEY,
  clinic_id UUID REFERENCES clinics(id),
  name VARCHAR(255), -- 'Default', 'Injectable Specialist', etc.
  fields JSONB, -- Stores form fields config
  created_at TIMESTAMP
);

-- Submitted Intakes (Responses)
CREATE TABLE intakes (
  id UUID PRIMARY KEY,
  clinic_id UUID REFERENCES clinics(id),
  patient_id UUID REFERENCES patients(id),
  appointment_id UUID REFERENCES appointments(id), -- Links to appointment
  form_id UUID REFERENCES intake_forms(id),
  responses JSONB, -- Stores patient's answers
  signed_consent BOOLEAN,
  signed_at TIMESTAMP,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Consent/Digital Signature Storage (HIPAA-compliant)
CREATE TABLE consents (
  id UUID PRIMARY KEY,
  patient_id UUID REFERENCES patients(id),
  clinic_id UUID REFERENCES clinics(id),
  consent_type VARCHAR(100), -- 'HIPAA', 'Treatment', 'Photo'
  signed_at TIMESTAMP,
  signature_data BYTEA, -- Digital signature (encrypted)
  ip_address VARCHAR(50),
  user_agent TEXT
);
```

**Modules in `packages/core`:**
- `intake/useIntakeForm.ts` — Form builder hook
- `intake/validateIntake.ts` — Validation logic
- `consent/digitalSignature.ts` — Signature verification
- `encryption/encrypt.ts` — Data at-rest encryption for sensitive fields

**Pages in `apps/portal-medspa`:**
- `/staff/intake-templates` — Admin: create/edit form templates
- `/staff/patients` — Staff: view all patients + intake status
- `/staff/appointment/[id]/review-intake` — Staff: review intake before appointment
- `/patient/intake/[token]` — Patient: fill out intake form (public link, no login required)

**HIPAA Compliance:**
- All form data encrypted at rest
- Audit logs for every intake submission
- Patient portal link expires after 7 days (configurable)
- Consent explicitly documented + timestamped
- No storage of payment info in intake (Payment module handles that separately)

---

### Phase 1B: Scheduling + Real-World Integration

#### Week 5: Scheduling System
**Objective:** Build real-time appointment booking with room + provider conflict detection (solves: double-booking + tool fragmentation).

**Deliverable:** Calendar + booking system with HIPAA controls

**Features:**
- [ ] **Provider + Room setup (Admin):**
  - Add providers (name, specialties, availability)
  - Add treatment rooms (name, amenities, equipment)
  - Set provider availability (hours, days)
  - Set room availability
  - Assign treatment types to rooms (e.g., "Injection room," "Laser room")

- [ ] **Real-time calendar (Staff view):**
  - Week/month view of all appointments
  - Show provider + room + treatment type per slot
  - **Conflict detection at time of booking:** Cannot book if:
    - Provider already booked
    - Room already booked
    - Required room type not available
  - System prevents double-booking (enforces at DB level with locks)

- [ ] **Patient booking (Patient-facing):**
  - Simple interface: select treatment → select provider (optional) → select time
  - Show only available slots (filtered by provider + room availability)
  - Confirm appointment details
  - Automated email/SMS confirmation (Postmark/Twilio integration — Phase 2 for automation; for now, manual)

- [ ] **Appointment reminders (Manual for now):**
  - Staff can manually send SMS/email reminders
  - **Phase 2:** Automated SMS 48h before appointment linking to intake form

**Database Schema:**

```sql
-- Providers
CREATE TABLE providers (
  id UUID PRIMARY KEY,
  clinic_id UUID REFERENCES clinics(id),
  name VARCHAR(255),
  specialties TEXT[], -- ['Injectables', 'Laser', 'Body']
  bio TEXT,
  availability JSONB, -- { "monday": ["09:00-17:00"], "tuesday": ... }
  created_at TIMESTAMP
);

-- Treatment Rooms
CREATE TABLE rooms (
  id UUID PRIMARY KEY,
  clinic_id UUID REFERENCES clinics(id),
  name VARCHAR(255), -- 'Injection Room 1', 'Laser Suite'
  capacity INT,
  amenities TEXT[], -- ['Private', 'Mirror', 'Laser Equipment']
  created_at TIMESTAMP
);

-- Treatment Types
CREATE TABLE treatment_types (
  id UUID PRIMARY KEY,
  clinic_id UUID REFERENCES clinics(id),
  name VARCHAR(255), -- 'Botox', 'Dermal Filler', 'Laser Hair Removal'
  duration_minutes INT,
  required_room_id UUID REFERENCES rooms(id), -- Can be NULL if any room works
  created_at TIMESTAMP
);

-- Appointments
CREATE TABLE appointments (
  id UUID PRIMARY KEY,
  clinic_id UUID REFERENCES clinics(id),
  patient_id UUID REFERENCES patients(id),
  provider_id UUID REFERENCES providers(id),
  room_id UUID REFERENCES rooms(id),
  treatment_type_id UUID REFERENCES treatment_types(id),
  scheduled_time TIMESTAMP,
  duration_minutes INT,
  status VARCHAR(50), -- 'scheduled', 'completed', 'cancelled', 'no-show'
  notes TEXT,
  intake_completed BOOLEAN DEFAULT FALSE,
  payment_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Prevent double-booking with database constraint
-- ALTER TABLE appointments ADD CONSTRAINT no_provider_conflicts
--   EXCLUDE USING GIST (
--     provider_id WITH =,
--     tsrange(scheduled_time, scheduled_time + (duration_minutes || ' minutes')::INTERVAL) WITH &&
--   );
-- ALTER TABLE appointments ADD CONSTRAINT no_room_conflicts
--   EXCLUDE USING GIST (
--     room_id WITH =,
--     tsrange(scheduled_time, scheduled_time + (duration_minutes || ' minutes')::INTERVAL) WITH &&
--   );
```

**Modules in `packages/core`:**
- `scheduling/useAvailability.ts` — Query available slots
- `scheduling/checkConflict.ts` — Conflict detection
- `scheduling/createAppointment.ts` — Safe appointment creation (with locks)
- `scheduling/types.ts` — Appointment, Provider, Room types

**Pages in `apps/portal-medspa`:**
- `/staff/providers` — Admin: manage providers
- `/staff/rooms` — Admin: manage treatment rooms
- `/staff/calendar` — Staff: view all appointments + book new
- `/staff/appointment/[id]` — Staff: view appointment details
- `/patient/book-appointment` — Patient: self-service booking (pre-appointment intake flow)

**Real-time Features (using Supabase Realtime):**
- When staff books appointment, calendar updates in real-time for all staff viewing it
- When provider availability changes, available slots update instantly

---

#### Weeks 6-8: Payments + Notifications Setup
**Objective:** Integrate Stripe payments + set up email/SMS infrastructure (solves: payment tracking + reminders).

**Deliverable:** Payment links + basic notification system

**Features - Payments:**
- [ ] **Payment link generation (Staff):**
  - Staff can create payment link for patient (invoice, deposit, full payment)
  - Link shows: amount, treatment, date, patient name
  - Send via email (Postmark integration)
  - Stripe payment page handles PCI compliance

- [ ] **Payment tracking (Staff + Patient view):**
  - Staff dashboard shows: appointment → intake status → payment status
  - Three-status indicator: Unpaid (red), Pending (yellow), Paid (green)
  - Patient sees payment status after booking

- [ ] **Payment webhook handling:**
  - Stripe webhook listener updates appointment status when payment completes
  - Update appointment `payment_completed = true`
  - Log audit entry: "Payment received for Appointment #123"

**Database Schema:**

```sql
-- Payments
CREATE TABLE payments (
  id UUID PRIMARY KEY,
  clinic_id UUID REFERENCES clinics(id),
  appointment_id UUID REFERENCES appointments(id),
  patient_id UUID REFERENCES patients(id),
  amount_cents INT,
  currency VARCHAR(3), -- 'USD'
  status VARCHAR(50), -- 'pending', 'completed', 'failed', 'refunded'
  stripe_payment_intent_id VARCHAR(255),
  payment_method VARCHAR(50), -- 'card', 'ach'
  created_at TIMESTAMP,
  completed_at TIMESTAMP
);
```

**Features - Notifications:**
- [ ] **Email system (Postmark integration):**
  - Intake reminder email: "Complete your intake for [Appointment]"
  - Payment reminder email: "Payment link for [Appointment]"
  - Confirmation email: "Your appointment is confirmed"
  - Staff can manually send these (automation in Phase 2)

- [ ] **SMS system (Twilio integration):**
  - SMS confirmation: "Your [Treatment] appointment is [Date/Time]. Intake: [link]"
  - Payment reminder SMS: "Payment due: [link]"
  - Staff can manually send (automation in Phase 2)

**Modules in `packages/core`:**
- `payments/createPaymentLink.ts` — Generate Stripe link
- `payments/handleWebhook.ts` — Process Stripe webhook
- `notifications/sendEmail.ts` — Postmark integration
- `notifications/sendSMS.ts` — Twilio integration

**Pages in `apps/portal-medspa`:**
- `/staff/appointment/[id]/payment` — Create payment link
- `/staff/appointment/[id]/send-reminder` — Send email/SMS reminder

**Stripe Integration:**
- Use Stripe API directly (not through Connect for now — that's Phase 2 when we extract this)
- Clinic provides Stripe API key (or Baseplate manages account; Phase 2 decision)
- Testing with Stripe test keys during Phase 1

---

### Phase 1C: Module Gaps + Architecture + Staging Deploy

#### Week 9: Polish + Bug Fixes
**Objective:** Make portal stable and ready for staging deploy.

**Deliverable:** Stable, deployable version

**Tasks:**
- [ ] Fix all critical bugs found during internal testing
- [ ] Improve UX for staff + patient flows
- [ ] Add better error messages
- [ ] Optimize performance (slow queries, large lists)
- [ ] Security review (OWASP top 10, HIPAA checklist)

**Testing Checklist:**
- Auth flow: signup, login, logout, password reset
- Intake creation + submission + signature
- Appointment booking with conflict prevention
- Payment link generation + webhook handling
- Email/SMS delivery
- Role-based access (owner sees all, staff sees own, patient sees own)
- Audit logging (check logs exist in DB)

---

#### Phase 1C Remaining Work: Module Gaps + Architecture + Staging Deploy

> **Customer onboarding (pilots) deferred to Phase 5.** See `PHASE_5_ONBOARDING_GUIDE.md`.
> Phase 1C focuses on closing module gaps, fixing architecture, resolving HIPAA, and staging deploy + smoke test.

**Phase 1C Tasks:**
- [ ] Close all module gaps from extraction checklist (see Section 6)
- [ ] Resolve architecture decisions (packages vs. apps boundary)
- [ ] Complete HIPAA baseline: encryption at rest, audit logging, RBAC enforcement on all endpoints
- [ ] Security review (OWASP top 10, HIPAA checklist)
- [ ] Performance optimization (slow queries, large lists)
- [ ] Deploy to staging environment (Railway + Supabase staging)
- [ ] Smoke test all core flows on staging (auth → intake → scheduling → payment)
- [ ] Document all modules (README + JSDoc on exports)

**Phase 1 → Phase 2 Gate (Build-Focused):**
- [ ] All 16+ modules extracted to `packages/` with tests + docs
- [ ] RBAC enforced on all endpoints (owner, staff, patient roles)
- [ ] Staging smoke test passes (all core flows working end-to-end)
- [ ] No blocking bugs
- [ ] HIPAA baseline implemented (encryption, audit logs, consent tracking)

---

## SECTION 2: ARCHITECTURE DECISIONS

### Why This Design

**Modular (packages/core + packages/ui):**
- Auth, RBAC, Audit Logs, Types are shared across all vertical templates
- When building Baseplate's 2nd vertical (Phase 3), reuse core
- UI components (Button, Form, Table) are reusable

**Postgres + Supabase:**
- Relational integrity for appointments + payments
- Real-time subscriptions for live calendar
- Auth + row-level security (for HIPAA)
- Audit logs immutable + queryable

**Next.js API Routes (for now):**
- Build portal + simple API in one app
- In Phase 2, extract API to standalone service (connect-api)
- This keeps iteration fast in Phase 1

**Stripe (not Square):**
- Stripe supports ACH (not just card)
- Stripe Connect prep for Phase 2+ (marketplace model)
- Test mode + production mode easy to manage

**Postmark + Twilio (not Sendgrid + AWS SMS):**
- Postmark: premium email deliverability, good for transactional
- Twilio: industry standard for SMS, proven for healthcare
- Both have good HIPAA compliance posture

---

### HIPAA Compliance Strategy (Phase 1)

**What We Own:**
- Data encryption at rest (Postgres with encryption)
- Encryption in transit (HTTPS/TLS)
- Audit logs (who, what, when)
- Access control (RBAC)
- Digital consent (signed, timestamped)
- PHI data handling (no photos in intake; stored separately)

**What We Don't Own Yet (Phase 2+):**
- Vendor BAA (Business Associate Agreement) with Supabase (and a BAA-signed app host: AWS/GCP/Azure) — Railway/Vercel do not offer a BAA
- Encryption key management (AWS KMS, etc.)
- Disaster recovery + backup encryption
- Penetration testing
- Compliance certification (HIPAA BAA)

**Phase 1 Compliance Posture:**
- "HIPAA-designed" infrastructure (not yet certified)
- Sufficient for staging build (no PHI from real patients yet)
- Document compliance gaps for Phase 2 → Phase 3 transition

---

### Scalability

**Phase 1 Limits (Acceptable):**
- Single Supabase instance (not high-availability)
- Railway Hobby (~$5/mo) → Pro tier as needed
- No caching layer (Redis)
- Direct database queries (no connection pooling)

**Scaling for Phase 2 (if needed):**
- Supabase replication + read replicas
- Railway Pro + auto-scaling
- Redis for session + caching
- PgBouncer for connection pooling
- CDN for static assets

**Staging load (~100-500 test patients, ~50 test appointments/week):**
- Well within Supabase free tier limits
- No optimization needed for Phase 1

---

## SECTION 3: IMPLEMENTATION CHECKLIST

### Phase 1A Milestones

- [ ] **Week 1:** Project setup, monorepo initialized, 1-Hour Challenge completed
- [ ] **Week 2:** Auth module working, RBAC in place, audit logs functional
- [ ] **Weeks 3-4:** Intake forms built, patient portal working, clinic admin can create forms

**Phase 1A Exit Criteria:**
- Core + auth + intake modules live
- Clinic admin can create 1 intake template
- Patient can sign up + fill intake
- All actions audit-logged
- Code deployed to staging environment

### Phase 1B Milestones

- [ ] **Week 5:** Scheduling system working, real-time calendar, conflict prevention
- [ ] **Week 6:** Stripe payment links generated, webhook handling working
- [ ] **Week 7:** Postmark email setup, Twilio SMS setup, manual send working
- [ ] **Week 8:** Polish + bug fixes, security review, performance optimization

**Phase 1B Exit Criteria:**
- Clinic can book appointments without double-booking
- Payment links generated + payments tracked
- Emails + SMS can be sent manually
- All core features working end-to-end
- Code passes security review
- Ready for staging deploy

### Phase 1C Milestones

- [ ] **Week 9:** Bug fixes, UX improvements, final polish
- [ ] **Weeks 10-12:** Module gaps closed, architecture fixes, HIPAA baseline, staging deploy + smoke test

**Phase 1C Exit Criteria:**
- All module gaps closed (16+ modules in `packages/`)
- RBAC complete and enforced on all endpoints
- Staging smoke test passes (all core flows working end-to-end)
- HIPAA baseline implemented (encryption, audit logs, consent)
- Phase 1 → Phase 2 gate passed (build-focused)

---

## SECTION 4: DEFINITION OF DONE

**Code Quality:**
- [ ] All code in TypeScript (no `any` unless justified)
- [ ] Components split into reusable units
- [ ] No console.log() left in production
- [ ] Error handling for all API calls
- [ ] Loading states on all async operations

**Testing:**
- [ ] Manual smoke test of happy path (auth → intake → payment)
- [ ] Role-based access tested (owner, staff, patient can't see each other's data)
- [ ] Conflict prevention tested (try booking same room twice — should fail)
- [ ] Payment webhook tested with Stripe test account

**Documentation:**
- [ ] README.md with setup instructions
- [ ] Inline code comments for complex logic
- [ ] Database schema documented
- [ ] Environment variables documented (.env.example)
- [ ] API endpoints documented (if shared with staff)

**Security:**
- [ ] OWASP top 10 checklist passed
- [ ] SQL injection prevention (use parameterized queries)
- [ ] XSS prevention (sanitize inputs, escape outputs)
- [ ] CSRF protection enabled
- [ ] HIPAA compliance checklist passed
- [ ] Sensitive data not logged (passwords, payment tokens)
- [ ] Audit logs immutable (no delete capability)

**Performance:**
- [ ] Page load < 3s (desktop)
- [ ] Page load < 5s (mobile)
- [ ] Calendar renders smoothly with 100+ appointments
- [ ] No N+1 queries (join instead of loop)

**Deployment:**
- [ ] Railway deployment successful
- [ ] Supabase staging database initialized
- [ ] Environment variables set in Railway
- [ ] Stripe test keys → production keys (Phase 5 only — before go-live)
- [ ] SSL certificate valid
- [ ] DNS pointing correctly

---

## SECTION 5: FAILURE MODES & MITIGATION

| Failure Mode | Impact | Mitigation |
|---|---|---|
| Double-booking happens despite conflict detection | Lost revenue, clinic unhappy | Database constraints (EXCLUDE USING GIST) + application validation |
| Payment webhook fails; payment recorded in Stripe but not in app | Revenue leak, patient confusion | Stripe webhook retry + manual reconciliation (Phase 2 feature) |
| Audit logs don't capture all actions | Compliance risk | Regular audit log review; test audit logging during QA |
| Intake form loses patient data mid-submission | Patient experience, repeated intake | Client-side validation + autosave (localStorage) + clear error messages |
| Staging data breach (shouldn't happen, but...) | Legal liability | Encryption, RBAC, audit logs, Supabase security posture |
| Module extraction incomplete; med spa code leaks into `packages/` | Phase 2 generalization blocked | Weekly extraction checklist (Section 6); enforce "would another vertical use this?" rule |

---

## SECTION 6: MODULE EXTRACTION CHECKLIST

**Use this checklist each week to ensure modules are being extracted properly.**

### Week 1-2 (Phase 1A)

**Auth Module (`packages/core/auth/`):**
- [ ] Created folder + index.ts
- [ ] Supabase Auth wrapper implemented
- [ ] Tests written (happy path + error cases)
- [ ] README.md with usage examples
- [ ] Exported from `packages/core/index.ts`
- [ ] Portal imports from package, not local file

**RBAC Module (`packages/core/rbac/`):**
- [ ] Created folder + index.ts
- [ ] Permission checker function implemented
- [ ] All roles tested (owner, staff, patient)
- [ ] README.md with usage examples
- [ ] Portal uses this, not custom permission logic

**Audit Logs Module (`packages/core/audit-logs/`):**
- [ ] Created folder + index.ts
- [ ] Log function implemented
- [ ] Every action in portal calls this
- [ ] Tests verify logging works
- [ ] README.md documented

**Module Documentation:**
- [ ] Each module has `packages/[module]/README.md`
- [ ] README includes: Purpose, Quick Start, API, Usage, Example
- [ ] JSDoc comments on all exports
- [ ] Vertical-specific parts documented (if any)

### Week 3-4 (Phase 1A)

**Core Modules Complete:**
- [ ] `encryption/` — Data encryption functions
- [ ] `types/` — All shared TypeScript types
- [ ] `config/` — Environment + feature flags
- [ ] All modules have tests + documentation
- [ ] All modules integrated into portal

**Portal Architecture:**
- [ ] Portal imports all core modules from `packages/core/`
- [ ] Zero custom auth logic (uses package)
- [ ] Zero custom permission logic (uses package)
- [ ] Zero custom audit logic (uses package)

### Phase 1B (Weeks 5-8)

**Integration Modules:**
- [ ] `integrations/stripe/` — Payment processing
- [ ] `integrations/postmark/` — Email sending
- [ ] `integrations/twilio/` — SMS sending
- [ ] `integrations/webhooks/` — Webhook handler
- [ ] All integrated into portal
- [ ] All tested + documented

**Module Quality Gate:**
- [ ] Each module has 80%+ test coverage
- [ ] Each module has comprehensive README
- [ ] Each module has JSDoc on all exports
- [ ] Each module can be used independently

### Phase 1C (Weeks 9-12)

**UI + Pattern Modules:**
- [ ] `ui/form/` — Form components
- [ ] `ui/table/` — Table component
- [ ] `ui/layout/` — Layout components
- [ ] `patterns/admin-setup/` — Setup flow
- [ ] `patterns/invite-user/` — Invite workflow
- [ ] `patterns/digital-signature/` — Signature capture
- [ ] `patterns/media-upload/` — File upload

**Module Extraction Complete:**
- [ ] All 16+ modules extracted
- [ ] Zero med spa specifics in `packages/`
- [ ] All modules documented
- [ ] All modules tested
- [ ] Ready for Phase 2 open-source

### Red Flags (Stop and Extract)

If you see this in `apps/portal-medspa/`, MOVE IT TO `packages/`:
- ❌ Auth functions (→ `packages/core/auth/`)
- ❌ Permission checks (→ `packages/core/rbac/`)
- ❌ Stripe API calls (→ `packages/integrations/stripe/`)
- ❌ Email sending (→ `packages/integrations/postmark/`)
- ❌ Form components (→ `packages/ui/form/`)
- ❌ Table components (→ `packages/ui/table/`)
- ❌ Logging logic (→ `packages/core/audit-logs/`)
- ❌ Encryption logic (→ `packages/core/encryption/`)

**Ask:** "Would another vertical use this?" If YES → extract to `packages/`

---

## SECTION 7: SUCCESS METRICS (Phase 1 Exit Gate)

**Quantitative (Build-Focused):**
- [ ] 16+ reusable modules extracted to `packages/` with tests + docs
- [ ] 100% of endpoints enforce RBAC (owner, staff, patient roles)
- [ ] Staging smoke test: all core flows pass end-to-end
- [ ] No critical bugs blocking staging deploy
- [ ] <5s page load time (measured on staging)
- [ ] 80%+ test coverage on core modules

**Qualitative:**
- [ ] All modules documented (README + JSDoc on exports)
- [ ] Architecture clean: zero med spa specifics in `packages/`
- [ ] HIPAA baseline: encryption, audit logs, RBAC, consent tracking
- [ ] Ready for Phase 2: clear list of module gaps for open-source generalization

**Minimum Viable Product Definition (Build):**
- Auth works (login, signup, logout, role-based access)
- Intake forms work (clinic creates, patient fills, signs, submits)
- Scheduling works (real-time, conflict prevention, appointment tracking)
- Payments work (link generation, tracking, webhook handling)
- Notifications work (manual email/SMS sending)
- HIPAA baseline (audit logs, encryption, RBAC, consent tracking)
- Deployed to staging with passing smoke test (customer onboarding deferred to Phase 5)

---

## RESOURCES & REFERENCE

**Related Documentation:**
- `Business Plan & Roadmap.md` — Full business model + Phases 1-5
- `Phase 0 - Vertical Validation.md` — Pain points + validation
- `Comprehensive Med Spa Market Research.md` — Vendor analysis + competitive intelligence
- `Phase 1 - The Wedge & First Build.md` — Timeline + high-level roadmap

**Tech Stack References:**
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Stripe API Reference](https://stripe.com/docs/api)
- [Postmark API](https://postmarkapp.com/developer)
- [Twilio API](https://www.twilio.com/docs)

**HIPAA & Compliance:**
- [HIPAA 101 for SaaS](https://www.hipaajournal.com/hipaa-compliance-checklist/)
- [AWS HIPAA Whitepaper](https://aws.amazon.com/compliance/hipaa-compliance/)
- [Supabase + HIPAA](https://supabase.com/docs/guides/security/hipaa)

**Recommended Tools for Development:**
- Cursor (AI-assisted development)
- Claude (code review, architecture discussion)
- Railway (frontend deployment)
- Supabase (backend + database)
- Stripe Dashboard (payment testing)
- Postmark + Twilio Console (email/SMS testing)

