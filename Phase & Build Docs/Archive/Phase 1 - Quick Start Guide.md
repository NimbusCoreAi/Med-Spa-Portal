# Phase 1: Quick Start Guide
## Med Spa Portal Implementation Reference

> **🔧 MAINTENANCE:** For current status, see [`../../MASTER_PROGRESS.md`](../../MASTER_PROGRESS.md). After completing any milestone or sub-phase, update it: (1) "At a Glance" table, (2) check off "What's Left" items, (3) add commit to "Build Log".

**Purpose:** Quick reference for developers during Phase 1 implementation  
**Audience:** Cursor, Claude, development team  
**Read Time:** 5 minutes  

⚠️ **CRITICAL:** You're not just building a med spa portal — you're building a **MODULE LIBRARY** for AI agents.
- Reusable code → `packages/`
- Med spa specific → `apps/portal-medspa/`
- See `MODULES_LIBRARY.md` for what gets extracted  

---

## 30-Second Summary

Build a HIPAA-compliant med spa portal (pure build phase) solving:
1. **Tool fragmentation** (Mindbody + Square + Google Drive → one portal)
2. **HIPAA compliance** (encrypted, role-based, audit logs)
3. **Intake tracking** (digital forms, patient signatures)
4. **Scheduling** (real-time, conflict prevention)
5. **Payments** (Stripe integration, tracking)

**Success:** All features built and tested, module gaps closed, staging smoke test passes.

---

## Phase-by-Phase Focus

| Phase | Focus | Pain Points Solved |
|---|---|---|
| **Phase 1A** | Auth + Intake | Fragmentation, Compliance, Forgotten Intakes |
| **Phase 1B** | Scheduling + Payments | No-Shows, Double-Booking, Payment Tracking |
| **Phase 1C** | Build Completion | Module gaps + architecture + staging deploy |

---

## Stack Summary (Day 1 Setup)

```
Frontend:   Next.js + React + Tailwind
Backend:    Next.js API routes → Postgres
Database:   Postgres via Supabase
Payments:   Stripe
Email:      Postmark
SMS:        Twilio
Deploy:     Vercel + Supabase
Auth:       Supabase Auth
```

---

## Database Core Tables (Phase 1A Start)

```sql
-- Users (via Supabase Auth + custom metadata)
-- Clinics
CREATE TABLE clinics (
  id UUID PRIMARY KEY,
  name VARCHAR(255),
  owner_id UUID REFERENCES auth.users(id)
);

-- Staff
CREATE TABLE staff (
  id UUID PRIMARY KEY,
  clinic_id UUID REFERENCES clinics(id),
  email VARCHAR(255),
  role VARCHAR(50) -- 'owner', 'staff'
);

-- Patients
CREATE TABLE patients (
  id UUID PRIMARY KEY,
  clinic_id UUID REFERENCES clinics(id),
  email VARCHAR(255),
  phone VARCHAR(20),
  first_name VARCHAR(255),
  last_name VARCHAR(255)
);

-- Intake Templates
CREATE TABLE intake_forms (
  id UUID PRIMARY KEY,
  clinic_id UUID REFERENCES clinics(id),
  name VARCHAR(255),
  fields JSONB -- Form fields config
);

-- Submitted Intakes
CREATE TABLE intakes (
  id UUID PRIMARY KEY,
  clinic_id UUID REFERENCES clinics(id),
  patient_id UUID REFERENCES patients(id),
  form_id UUID REFERENCES intake_forms(id),
  responses JSONB, -- Patient's answers
  signed_consent BOOLEAN,
  signed_at TIMESTAMP
);

-- Audit Logs (CRITICAL for HIPAA)
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY,
  clinic_id UUID REFERENCES clinics(id),
  user_id UUID REFERENCES auth.users(id),
  action VARCHAR(100), -- 'login', 'create_patient', 'view_photo', etc.
  resource_type VARCHAR(50), -- 'patient', 'appointment', etc.
  resource_id UUID,
  timestamp TIMESTAMP
);
```

**Phase 1B Additions:**
```sql
-- Providers
CREATE TABLE providers (
  id UUID PRIMARY KEY,
  clinic_id UUID REFERENCES clinics(id),
  name VARCHAR(255),
  specialties TEXT[]
);

-- Treatment Rooms
CREATE TABLE rooms (
  id UUID PRIMARY KEY,
  clinic_id UUID REFERENCES clinics(id),
  name VARCHAR(255)
);

-- Appointments
CREATE TABLE appointments (
  id UUID PRIMARY KEY,
  clinic_id UUID REFERENCES clinics(id),
  patient_id UUID REFERENCES patients(id),
  provider_id UUID REFERENCES providers(id),
  room_id UUID REFERENCES rooms(id),
  scheduled_time TIMESTAMP,
  intake_completed BOOLEAN,
  payment_completed BOOLEAN
);

-- Payments
CREATE TABLE payments (
  id UUID PRIMARY KEY,
  clinic_id UUID REFERENCES clinics(id),
  appointment_id UUID REFERENCES appointments(id),
  amount_cents INT,
  status VARCHAR(50), -- 'pending', 'completed'
  stripe_payment_intent_id VARCHAR(255)
);
```

---

## Key Implementation Patterns

### 1. HIPAA Audit Logging (Phase 1A)
Every sensitive action logs to `audit_logs`:
```typescript
// packages/core/audit/logAction.ts
export async function logAction(
  clinicId: string,
  userId: string,
  action: string,
  resourceType: string,
  resourceId: string
) {
  await supabase
    .from('audit_logs')
    .insert({
      clinic_id: clinicId,
      user_id: userId,
      action,
      resource_type: resourceType,
      resource_id: resourceId,
      timestamp: new Date()
    });
}
```

**Log these actions:**
- login, logout
- create_patient, view_patient, update_patient
- create_intake, submit_intake, view_intake
- view_photo, upload_photo
- create_appointment, cancel_appointment
- create_payment, process_payment

### 2. Role-Based Access Control (Phase 1A)
```typescript
// packages/core/rbac/getRolePermissions.ts
const PERMISSIONS = {
  owner: {
    view_all_patients: true,
    view_all_appointments: true,
    view_all_payments: true,
    view_audit_logs: true,
    create_staff: true,
    delete_staff: true
  },
  staff: {
    view_assigned_patients: true,
    view_assigned_appointments: true,
    create_appointment: true,
    create_payment_link: true
  },
  patient: {
    view_own_appointments: true,
    view_own_intake: true,
    submit_intake: true,
    view_own_payments: true
  }
};
```

### 3. Intake Form Builder (Phase 1A)
```typescript
// packages/core/intake/buildForm.ts
interface FormField {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'checkbox' | 'select' | 'date';
  required: boolean;
  options?: string[]; // for select
}

// Predefined templates
const TEMPLATES = {
  standard: [
    { id: 'allergies', label: 'Allergies', type: 'textarea' },
    { id: 'medications', label: 'Current Medications', type: 'textarea' },
    { id: 'conditions', label: 'Medical Conditions', type: 'textarea' },
    { id: 'consent', label: 'I consent to treatment', type: 'checkbox' }
  ]
};
```

### 4. Real-Time Scheduling with Conflict Prevention (Phase 1B)
```typescript
// Database constraint prevents double-booking
ALTER TABLE appointments ADD CONSTRAINT no_provider_conflicts
  EXCLUDE USING GIST (
    provider_id WITH =,
    tsrange(scheduled_time, scheduled_time + (duration_minutes || ' minutes')::INTERVAL) WITH &&
  );

// App-level validation
export async function checkConflict(
  providerId: string,
  roomId: string,
  startTime: Date,
  durationMinutes: number
): Promise<boolean> {
  const endTime = new Date(startTime.getTime() + durationMinutes * 60000);
  
  const conflicts = await supabase
    .from('appointments')
    .select('id')
    .or(
      `and(provider_id.eq.${providerId},scheduled_time.gte.${startTime.toISOString()},scheduled_time.lt.${endTime.toISOString()})` +
      `,and(room_id.eq.${roomId},scheduled_time.gte.${startTime.toISOString()},scheduled_time.lt.${endTime.toISOString()})`
    );
  
  return conflicts.data && conflicts.data.length === 0;
}
```

### 5. Stripe Integration (Phase 1B)
> **Approach note:** This guide shows the Payment Intent flow (custom UI on your side). The Build Guide Part 2 shows the Payment Link flow (Stripe-hosted checkout page). Both are valid — **use Payment Links** if you want Stripe to host the checkout page (simplest for Phase 1), or **use Payment Intents** if you need a custom payment UI embedded in the portal. In both cases, the webhook should listen for `payment_intent.succeeded`.

```typescript
// packages/core/payments/createPaymentLink.ts
export async function createPaymentLink(
  appointmentId: string,
  amountCents: number
) {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amountCents,
    currency: 'usd',
    metadata: { appointmentId }
  });
  
  await supabase
    .from('payments')
    .insert({
      appointment_id: appointmentId,
      amount_cents: amountCents,
      status: 'pending',
      stripe_payment_intent_id: paymentIntent.id
    });
  
  return paymentIntent.client_secret;
}

// Webhook handler
export async function handleStripeWebhook(event: Stripe.Event) {
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const appointmentId = paymentIntent.metadata.appointmentId;
    
    await supabase
      .from('appointments')
      .update({ payment_completed: true })
      .eq('id', appointmentId);
      
    await logAction(..., 'payment_completed', 'appointment', appointmentId);
  }
}
```

---

## Critical HIPAA Checkpoints

**Phase 1A:**
- [ ] Audit logs function (test: every login/logout logged)
- [ ] RBAC enforced (test: patient can't see other patient's intake)
- [ ] Encryption enabled in DB
- [ ] SSL/TLS on all endpoints
- [ ] Sensitive data not logged (no passwords, no payment tokens)

**Phase 1B:**
- [ ] Photo storage encrypted
- [ ] Photo access logged
- [ ] Consent signed + timestamped
- [ ] No data stored in plain text

**Phase 1C:**
- [ ] OWASP top 10 checklist
- [ ] No SQL injection vulnerabilities
- [ ] No XSS vulnerabilities
- [ ] CSRF protection enabled
- [ ] Rate limiting on auth endpoints

---

## Testing Checklist (Phase 1C)

**Happy Path (End-to-End):**
- [ ] Clinic owner signs up → creates clinic profile
- [ ] Clinic owner invites staff → staff accepts
- [ ] Staff creates patient → patient receives invite
- [ ] Patient fills intake form → signs consent
- [ ] Staff books appointment → conflict prevention tested
- [ ] Staff creates payment link → patient pays via Stripe
- [ ] Webhook updates appointment status → payment_completed = true

**Role-Based Access:**
- [ ] Owner can see all data
- [ ] Staff can see only their clinic's data
- [ ] Patient can see only their own data
- [ ] Patient cannot access staff portal

**Conflict Prevention:**
- [ ] Try booking same provider twice → fails
- [ ] Try booking same room twice → fails
- [ ] Try booking overlapping time → fails
- [ ] View calendar → all bookings correct

**Security:**
- [ ] Login with wrong password → fails
- [ ] Access /staff endpoint without login → redirects to login
- [ ] Tampering with clinic_id in URL → 403 forbidden
- [ ] Audit log shows every action

---

## Performance Targets (Phase 1C)

- [ ] Page load: <3s desktop, <5s mobile
- [ ] Calendar with 100+ appointments: smooth scroll
- [ ] Payment webhook: <500ms response
- [ ] Intake form submission: <1s response
- [ ] No N+1 queries (use JOINs, not loops)

---

## Failure Mode Mitigations

| Scenario | Mitigation |
|---|---|
| Stripe webhook fails | Store as `pending`, retry with cron job (Phase 2), manual override for staff |
| Patient loses intake data mid-form | Client-side autosave + localStorage, session recovery |
| Double-booking slip through | Database constraint + app validation, staff override capability |
| HIPAA audit finds gaps | Audit log review, fix + retroactive documentation |
| SMS doesn't deliver | Monitor Twilio dashboard, fallback to email |
| Clinic data lost | Supabase automatic backups (handled by provider) |

---

## Pilot Feedback

Pilot feedback collection deferred to Phase 5. See `PHASE_5_ONBOARDING_GUIDE.md`.

---

## Cursor + Claude Tips

When asking Claude for help:
- **Architecture:** "Should we use [X] or [Y] for [problem]?" → explain tradeoffs
- **Code Review:** Paste code → "Does this have security issues?" → specific HIPAA concerns
- **Debugging:** "This [feature] isn't working. Here's the error: [error]" → help diagnose
- **Testing:** "How do we test [feature]?" → test cases, edge cases, failure modes

Use Cursor for:
- Auto-completing boilerplate code
- Generating database migrations
- Refactoring large functions
- Finding bugs in existing code

---

## Key Files to Know

**Core Modules (`packages/core/`):**
- `auth/` — Auth hooks, HOCs, utilities
- `rbac/` — Permission checking
- `audit/` — Logging utility
- `intake/` — Form builder hooks
- `payments/` — Payment link generation
- `types.ts` — Shared TypeScript types

**Portal Pages (`apps/portal-medspa/`):**
- `/auth/` — signup, login
- `/staff/` — staff portal (dashboard, calendar, patients)
- `/staff/intake-templates` — admin: create forms
- `/staff/patients/[id]` — view patient details
- `/patient/` — patient portal (intake, appointments)

**Tests (Phase 1C):**
- `tests/auth.test.ts` — Login, logout, RBAC
- `tests/intake.test.ts` — Form creation, submission
- `tests/scheduling.test.ts` — Conflict detection
- `tests/payments.test.ts` — Stripe webhook

---

## Week-by-Week Implementation Order

**Week 1-2:** Auth + RBAC + Audit Logs  
**Week 3-4:** Intake Forms  
**Week 5-6:** Scheduling System  
**Week 7-8:** Payments + Email/SMS  
**Week 9-10:** Polish + Bug Fixes  
**Week 11-12:** Staging Deploy + Final Testing  

---

## Success Definition for Phase 1

**Hard Metrics:**
- ✅ All core modules built and tested (auth, intake, scheduling, payments)
- ✅ Intake completion >80%
- ✅ Payment webhook success 100%
- ✅ Page load <3s
- ✅ No critical bugs

**Soft Metrics:**
- ✅ Fragmentation solved (single portal replaces Mindbody + Square + Google Drive)
- ✅ Scheduling system tested with conflict prevention
- ✅ Intake flow tested end-to-end (create → fill → sign → submit)
- ✅ Clear 2-3 Phase 2 features identified

---

**Next:** Read `Phase 1 - Scaffold Specification.md` for detailed feature specs.

