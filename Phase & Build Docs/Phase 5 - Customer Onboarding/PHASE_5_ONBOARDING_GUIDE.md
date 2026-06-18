# Phase 5 Onboarding Guide — Production Deploy, Pilot Recruitment & Feedback

> **Purpose:** Everything a human must do to execute Phase 5 — Customer Onboarding. This is the
> tactical companion to the [Phase 5 Process Guide](Phase%20%26%20Build%20Docs/Phase%205%20-%20Customer%20Onboarding/Process.md).
>
> **Prerequisite:** Phases 1-4 are complete. The platform is built, tested, open-sourced, and
> deployed to staging. Staging smoke test passed.
>
> **What this guide covers:**
> - Part 1: Pilot Recruitment Action Items
> - Part 2: Pilot Details Recording Template
> - Part 3: Production Deploy Checklist
> - Part 4: The 4-Touch Onboarding Sequence (Call 1-3 + Check-in)
> - Part 5: Staff Training Guide
> - Part 6: Baseline Metrics Recording Template
> - Part 7: Feedback Cadence & Call Templates
> - Part 8: Feedback Log Template
> - Part 9: Phase 5 Gate Check
>
> **After completing this guide:** Update [`MASTER_PROGRESS.md`](MASTER_PROGRESS.md) —
> check off items in "What's Left" section and add commits to the Build Log.

---

## Table of Contents

- [Part 1: Pilot Recruitment Action Items](#part-1-pilot-recruitment-action-items)
- [Part 2: Pilot Details Recording Template](#part-2-pilot-details-recording-template)
- [Part 3: Production Deploy Checklist](#part-3-production-deploy-checklist)
- [Part 4: The 4-Touch Onboarding Sequence](#part-4-the-4-touch-onboarding-sequence)
- [Part 5: Staff Training Guide](#part-5-staff-training-guide)
- [Part 6: Baseline Metrics Recording Template](#part-6-baseline-metrics-recording-template)
- [Part 7: Feedback Cadence & Call Templates](#part-7-feedback-cadence--call-templates)
- [Part 8: Feedback Log Template](#part-8-feedback-log-template)
- [Part 9: Phase 5 Gate Check](#part-9-phase-5-gate-check)

---

## Part 1: Pilot Recruitment Action Items

> **Outreach templates:** Use [`COLD_OUTREACH_PLAYBOOK.md`](COLD_OUTREACH_PLAYBOOK.md) (6 channels)
> and [`PILOT_LEADS_AND_TEMPLATES.md`](PILOT_LEADS_AND_TEMPLATES.md) (50+ verified leads).

### Step 1: Select Your Targets

- [ ] Review the 50+ leads in `PILOT_LEADS_AND_TEMPLATES.md`
- [ ] Segment by: region, owner type (physician/NP/entrepreneur), clinic size, specialty
- [ ] Select your **15-20 warmest prospects** (highest likelihood to respond + best pain-point fit)
- [ ] Prioritize: 1-2 multi-location operators, 1-2 physician-owned, 1-2 female-owned (diverse pain points)

### Step 2: Execute Outreach Sequences

- [ ] Choose sequence per lead: email-led (primary), social-led (Instagram-active), or call-led (local)
- [ ] Send initial outreach to first batch of 5-7 clinics
- [ ] Follow up per cadence rules (see playbook: 2 days between touches, max 6 touches, always log next action)
- [ ] Reply within 2 hours when a lead responds — momentum is everything
- [ ] Expand to next batch of 10-15 clinics after first responses come in

### Step 3: Conduct Discovery Calls (15 min each)

For each interested clinic:

- [ ] Confirm they have the pain points you solve (fragmented tools, no-shows, intake issues)
- [ ] Assess willingness to commit to 20-30 min biweekly feedback calls
- [ ] Confirm they can start within 2 weeks of production deploy
- [ ] Demo the product (10-min screen share or Loom video)

### Step 4: Secure Commitments

- [ ] Get firm confirmation from 3+ clinics (verbal or written)
- [ ] Send pilot agreement email confirming terms:

> **Subject:** Pilot confirmation — [Clinic Name] × Baseplate Portal
>
> Hi [Name],
>
> Excited to have [Clinic Name] on board as a pilot! Here's what we agreed:
>
> - **Free through Month 6** — no cost, no contract
> - **20-30 min feedback call every 2 weeks** — your honest input shapes the product
> - **I handle all setup** — onboarding takes about 30 min per session, 3 sessions total
> - **You get:** scheduling, digital intake, Stripe payments, SMS/email reminders, audit logs — all HIPAA-secure
>
> I'll schedule our kickoff call for [date]. Looking forward to it!
>
> [Your name]

### Step 5: Record Pilot Details

For each committed pilot, fill out the [Pilot Details Template](#part-2-pilot-details-recording-template) below.

---

## Part 2: Pilot Details Recording Template

Create one record per pilot clinic. Store in a spreadsheet or simple CRM.

### Pilot Clinic Record

```
═══════════════════════════════════════════════════════════
CLINIC:    [Clinic Name]
OWNER:     [Owner Name]
EMAIL:     [Owner Email]
PHONE:     [Owner Phone]
ADDRESS:   [Clinic Address]

CURRENT SOFTWARE:    [Mindbody / Vagaro / Paper / Other]
NUM PROVIDERS:       [Count]
NUM STAFF:           [Count]
APPROX PATIENTS/MO:  [Count]

MAIN PAIN POINTS (from discovery call):
  1. _______________________________________________
  2. _______________________________________________
  3. _______________________________________________

SERVICES OFFERED:
  [Botox / Filler / IV Therapy / Facials / Weight Loss / Laser / Other]

PORTAL CHAMPION:     [Name of staff member who will be the go-to person]
TECHNICAL CONTACT:   [Name + email for technical questions]

DISCOVERY CALL DATE:    [Date]
COMMITMENT CONFIRMED:   [Date + method: verbal/written]
KICKOFF CALL SCHEDULED: [Date]

PILOT START DATE:       [Date]
FREE PERIOD ENDS:       [Date + 6 months]

FEEDBACK CALL SCHEDULE: [Biweekly: every other ___day at ___time]
═══════════════════════════════════════════════════════════
```

### Tracking Multiple Pilots

| Clinic | Owner | Email | Phone | Current Software | Pain Points | Kickoff Date | Pilot Start | Status |
|--------|-------|-------|-------|-----------------|-------------|-------------|-------------|--------|
| [Clinic 1] | | | | | | | | Committed |
| [Clinic 2] | | | | | | | | Committed |
| [Clinic 3] | | | | | | | | Committed |

---

## Part 3: Production Deploy Checklist

> **Note:** The staging deployment was completed in Phase 1 (see `PHASE_1_STAGING_DEPLOY.md`).
> This section covers switching from staging to production with live integrations.

### A. Stripe — Switch to Live Mode

1. Go to **Stripe Dashboard** → exit Test Mode (toggle top right)
2. Copy the **live secret key** (`sk_live_...`) → update `STRIPE_SECRET_KEY` in Railway
3. Go to **Developers → Webhooks** → update endpoint URL to production domain
4. Copy the live **signing secret** (`whsec_...`) → update `STRIPE_WEBHOOK_SECRET` in Railway
5. Create **Stripe Products** for subscription tiers (Connect, Intelligence add-on) — needed for revenue conversion later

- [ ] Stripe live keys set in Railway
- [ ] Webhook endpoint updated to production URL
- [ ] Webhook signing secret updated
- [ ] Test a live payment (process a $1 test charge, verify webhook fires)

### B. Supabase — Upgrade to Pro + Production Config

1. Go to **Supabase Dashboard → Project Settings → Billing** → upgrade to **Pro tier**
   - Required for: production backups, daily snapshots, no project pausing
2. Go to **Authentication → Settings**:
   - Set **Site URL** to production domain
   - Ensure **Redirect URLs** includes production domain
   - **Re-enable email confirmation** (now safe — Phase 2 built server-side signup)
3. Go to **Database → Backups** → verify automated backups are enabled

- [ ] Supabase Pro tier active
- [ ] Auth URLs point to production domain
- [ ] Email confirmation re-enabled
- [ ] Automated backups verified

### C. Twilio — Upgrade from Trial

1. Go to **Twilio Console → Billing** → add payment method, upgrade to paid account
2. This removes trial restrictions (can now SMS any number, no trial prefix)
3. Verify your Twilio phone number works for outbound SMS to pilot clinic numbers

- [ ] Twilio upgraded to paid account
- [ ] Test SMS sent to a real phone number successfully

### D. Postmark — Verify Production Domain

1. Go to **Postmark → Domains** → ensure DKIM + Return-Path DNS records are verified
2. Update `POSTMARK_FROM_EMAIL` to your production domain (e.g. `noreply@yourdomain.com`)
3. Test sending an email through the production app

- [ ] Domain authentication verified (DKIM green)
- [ ] Production from-email set
- [ ] Test email received successfully

### E. Railway — Update Environment Variables + Redeploy

1. Go to **Railway → Service → Variables**
2. Update all variables to production values:
   - `NEXT_PUBLIC_APP_URL` → production domain
   - `STRIPE_SECRET_KEY` → live key
   - `STRIPE_WEBHOOK_SECRET` → live signing secret
   - All others as needed
3. **Redeploy** (Railway → Service → Settings → Redeploy)

- [ ] All env vars updated to production values
- [ ] Production deployment successful
- [ ] App loads at production URL without errors

### F. Production Smoke Test

Run the full happy path against the **production** deployment:

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Go to production URL | Landing/login page loads |
| 2 | Sign up a new clinic | Clinic + owner account created |
| 3 | Log in | Dashboard loads |
| 4 | Add a provider + room | Saved successfully |
| 5 | Add a patient | Saved successfully |
| 6 | Create an appointment | Appointment appears |
| 7 | Generate payment link | Stripe checkout URL created (LIVE) |
| 8 | Complete a real payment ($1 test) | Payment processed, status updated via webhook |
| 9 | Check email notification | Postmark email received |
| 10 | Check SMS notification | Twilio SMS received |
| 11 | Submit an intake form | Saved with e-signature |
| 12 | Check audit logs | Recent actions logged |

- [ ] All 12 production smoke test steps pass
- [ ] No console errors in production

---

## Part 4: The 4-Touch Onboarding Sequence

> Space touches 2-5 days apart depending on clinic availability. Each pilot goes through all 4 touches.

### Touch 1: Kickoff Call (30-45 min)

**Goal:** Get the clinic set up and confident with the basics.

**Pre-call prep:**
- [ ] Confirm production URL and login credentials are ready
- [ ] Have the pilot's details from Part 2 on hand
- [ ] Have the intake form builder open and ready

**Agenda:**

1. **Welcome & Overview (5 min)**
   - Thank them for piloting
   - Quick tour of the dashboard: what each section does
   - Set expectations: "By the end of this call, your clinic will be set up"

2. **Account Setup (10 min)**
   - Log in as owner
   - Configure clinic settings: name, location, services offered
   - Verify owner can navigate the dashboard independently

3. **Provider Setup (10 min)**
   - Add each provider (name, role, specialty)
   - Set up schedule templates (working hours, lunch breaks)
   - Confirm providers appear on the booking page

4. **Room Setup (5 min)**
   - Add each treatment room/space
   - Confirm rooms are available for scheduling

5. **Wrap-up (5 min)**
   - Confirm they can log in on their own
   - Schedule Touch 2 (Data Setup) for 2-3 days later
   - Ask them to think about: their service list, patient import, intake form fields

**After call:**
- [ ] Send follow-up email with login URL and a quick-start summary
- [ ] Log any issues encountered
- [ ] Schedule Touch 2

### Touch 2: Data Setup Call (30-45 min)

**Goal:** Get real data flowing into the system.

**Pre-call prep:**
- [ ] Ask the clinic to bring: their service/pricing list, a list of 10-20 existing patients (name, email, phone)
- [ ] Have the intake form builder ready

**Agenda:**

1. **Service Catalog Setup (10 min)**
   - Add services: name, duration, price, category
   - Map services to providers (who can perform what)
   - Confirm services appear on the booking page

2. **Patient Import (10 min)**
   - Manually add 10-20 existing patients (or bulk import if tooling exists)
   - Minimum fields: first name, last name, email, phone
   - Verify patients appear in the patients list

3. **Intake Form Configuration (15 min)**
   - Review default intake form fields
   - Customize: add/remove fields per clinic's needs
   - Add clinic-specific consent text (HIPAA acknowledgment, treatment consent)
   - Test the form: fill it out as a test patient, submit, verify it saves

4. **Payment Setup (5 min)**
   - Confirm Stripe is connected to their account
   - Generate a test payment link for an appointment
   - Verify the link opens a Stripe checkout page

5. **Wrap-up (5 min)**
   - Confirm data looks correct
   - Schedule Touch 3 (Patient Flow Walkthrough) for 2-3 days later
   - Ask them to start using the portal for real patients in the meantime

**After call:**
- [ ] Send summary of what was configured
- [ ] Log any issues or customizations needed

### Touch 3: Patient Flow Walkthrough (30-45 min)

**Goal:** Prove the complete patient journey works end-to-end for their clinic.

**Agenda:**

Walk through the full patient journey together in real-time:

1. **Booking (5 min)**
   - Open the patient-facing booking page
   - Select a provider and time slot
   - Confirm a booking — appointment created

2. **Notification (3 min)**
   - Verify booking confirmation was sent (email + SMS)
   - Check the notification content looks correct

3. **Intake (10 min)**
   - Open the intake form link
   - Fill out the form as a patient would
   - Add e-signature
   - Submit — verify it saves and staff can view it

4. **Check-in & Appointment (5 min)**
   - Show how staff checks the daily schedule
   - Mark a patient as "arrived"
   - Show how to view the patient's intake form

5. **Payment (5 min)**
   - Generate a payment link for the appointment
   - Send it to the patient (or open it)
   - Process a payment (live $1 test or real payment)
   - Verify webhook updates the payment status

6. **Follow-up (5 min)**
   - Show how automated follow-up notifications work
   - Verify the next appointment reminder is scheduled

7. **Q&A and Workflow Gaps (10 min)**
   - "Does this match how your clinic actually operates?"
   - Identify any workflow adjustments needed (custom fields, different notification timing, etc.)
   - Log anything that needs to be built/changed

**After call:**
- [ ] Schedule Touch 4 (Week 2 Check-in)
- [ ] Log any workflow gaps or feature requests
- [ ] Begin addressing identified issues

### Touch 4: Week 2 Check-in (20-30 min)

**Goal:** Ensure adoption, address friction, collect initial feedback.

**Pre-call prep:**
- [ ] Review their usage data: how many appointments, intakes, payments since Touch 3?
- [ ] Note any error logs or issues from their account

**Agenda:**

1. **Usage Review (5 min)**
   - "How many patients have you booked through the portal so far?"
   - Share any usage stats you can see
   - If adoption is low: identify the blocker (staff not trained? forgot to use it? prefer old method?)

2. **Friction Points (10 min)**
   - "What's been confusing or frustrating?"
   - "Is there anything that takes more clicks than it should?"
   - Walk through any reported issues live and fix or log them

3. **What's Working (5 min)**
   - "What do you like so far?"
   - "What would you miss if it went away?"
   - Note these for testimonials later

4. **Feedback Call Schedule (5 min)**
   - Confirm biweekly feedback call schedule
   - Set the next call date
   - Ask them to start noting feedback between calls (email or shared doc)

**After call:**
- [ ] Log all feedback in the [Feedback Log](#part-8-feedback-log-template)
- [ ] Triage issues per the feedback process
- [ ] Begin the biweekly feedback cadence

---

## Part 5: Staff Training Guide

Each pilot's staff needs to be comfortable using the portal independently. Schedule a group training session after Touch 2 or 3.

### Training Session (15-20 min, group)

**Audience:** All staff members at the clinic (front desk, nurses, providers, owner)

**Pre-requisites:**
- [ ] Staff accounts created for each team member (role: staff or owner as appropriate)
- [ ] Each staff member has login credentials
- [ ] Clinic data is set up (providers, rooms, services, patients)

**Agenda:**

1. **Login & Dashboard Tour (3 min)**
   - Everyone logs in
   - Walk through the dashboard: what each card/section means
   - Show how to navigate between sections

2. **Daily Workflow: Appointments (5 min)**
   - How to view today's schedule
   - How to create an appointment
   - How to mark a patient as arrived
   - How to view appointment details

3. **Daily Workflow: Intake Forms (3 min)**
   - How to check if a patient has submitted their intake
   - How to view a completed intake form
   - How to resend the intake link if a patient hasn't filled it out

4. **Daily Workflow: Payments (3 min)**
   - How to generate a payment link for an appointment
   - How to check payment status
   - How to see which appointments are unpaid

5. **Role-Specific (2 min)**
   - **Owner:** How to view audit logs, manage staff, see reports
   - **Staff:** How to manage patients, appointments, and payments

6. **Q&A (4 min)**
   - Answer questions
   - Identify any confusion to address

### Quick-Reference Guide (1-Page Cheat Sheet)

Provide each staff member a printed or digital 1-page guide:

```
══════════════════════════════════════════════════════════
                    PORTAL QUICK REFERENCE
══════════════════════════════════════════════════════════

LOGIN:     [Production URL]
SUPPORT:   [Your email/phone]

DAILY TASKS:
  View schedule .......... Dashboard → Appointments
  Create appointment ..... Appointments → New Appointment
  Check patient in ....... Appointments → Click patient → "Arrived"
  View intake form ....... Patients → Click patient → Intake tab
  Send payment link ...... Appointments → Click → "Send Payment"
  Check payment status ... Appointments → Payment column

PROBLEMS?
  Can't log in? .......... Check email/password, contact owner
  Patient didn't get intake? . Patients → Resend intake link
  Payment not showing? ... Wait 1 min (webhook), refresh page
  Other? ................. Contact [portal champion name]

══════════════════════════════════════════════════════════
```

### Portal Champion

Identify one staff member per clinic as the "portal champion":
- The go-to person for questions from other staff
- First point of contact for you between feedback calls
- Typically the most tech-comfortable front desk person or office manager

- [ ] Portal champion identified and confirmed for each pilot
- [ ] Champion has your direct contact info (email + phone)

---

## Part 6: Baseline Metrics Recording Template

Record baseline metrics for each pilot **before** they start using the portal for real patients. This lets you measure improvement at each feedback call.

### Per-Clinic Baseline Sheet

```
══════════════════════════════════════════════════════════
CLINIC: [Clinic Name]
DATE RECORDED: [Date]
RECORDED BY: [Who provided the data — owner, office manager]
══════════════════════════════════════════════════════════

OPERATIONAL METRICS (Before Portal):
  No-show rate:                   ___% per month
  Intake completion before appt:  ___% (how many patients
                                   arrive with forms done?)
  Avg time to collect payment:    ___ days after appointment
  Appointment booking method:     [Phone / Online / Walk-in / Mix]
  Reminder method:                [Phone calls / SMS / Email / None]

TIME METRICS:
  Hours/day on scheduling:        ___ hours
  Hours/day on intake management:  ___ hours
  Hours/day on payment follow-up: ___ hours
  Total admin hours/day:          ___ hours

COST METRICS:
  Current scheduling software:    $___/month
  Payment processing:             $___/month
  Intake/forms tool:              $___/month
  SMS/reminder tool:              $___/month
  Total monthly software cost:    $___/month

CLINIC SIZE:
  Number of providers:            ___
  Number of staff:                ___
  Appointments per month:         ___
  Active patients:                ___
══════════════════════════════════════════════════════════
```

### Improvement Tracking

At each biweekly feedback call, record the current values:

| Metric | Baseline | Week 2 | Week 4 | Week 6 | Week 8 | Month 3 |
|--------|----------|--------|--------|--------|--------|---------|
| No-show rate | ___% | ___% | ___% | ___% | ___% | ___% |
| Intake completion | ___% | ___% | ___% | ___% | ___% | ___% |
| Payment collection time | ___ days | ___ | ___ | ___ | ___ | ___ |
| Admin hours/day | ___ | ___ | ___ | ___ | ___ | ___ |
| Monthly software cost | $___ | $0 | $0 | $0 | $0 | $0 |

> **At Month 3 and Month 6:** Do a deep-dive review comparing current metrics to baseline. This
> data is your case study for converting pilots to paying customers and recruiting new ones.

---

## Part 7: Feedback Cadence & Call Templates

### Feedback Call Schedule

| Call | When | Duration | Focus |
|------|------|----------|-------|
| Touch 4 | Week 2 | 20-30 min | Initial friction, adoption check |
| Feedback Call 2 | Week 4 | 20-30 min | First real usage feedback |
| Feedback Call 3 | Week 6 | 20-30 min | Deeper feature requests |
| Feedback Call 4 | Week 8 | 20-30 min | Habit formation check |
| Deep-Dive Review | Month 3 | 45-60 min | Full metrics review, pain-point audit |
| Feedback Call 6 | Month 4 | 20-30 min | ML insights review, conversion preview |
| Pilot Review | Month 6 | 45-60 min | Full review, conversion conversation |

### Feedback Call Template (20-30 min)

Use this structure for every biweekly feedback call:

```
══════════════════════════════════════════════════════════
FEEDBACK CALL — [Clinic Name]
Date: [Date] | Call #: [#] | Duration: [Actual]

1. WHAT'S WORKING WELL? (5 min)
   ─────────────────────────────
   [Listen first. Let them tell you what they like.]
   Notes:
   • _______________________________________________
   • _______________________________________________
   • _______________________________________________

2. WHAT'S FRUSTRATING OR CONFUSING? (10 min)
   ─────────────────────────────────────────
   [Dig into specifics. Ask "walk me through when that happens."]
   Notes:
   • _______________________________________________
   • _______________________________________________
   • _______________________________________________

3. WHAT'S MISSING? (5 min)
   ───────────────────────
   [Features they wish existed. Don't promise — just log.]
   Notes:
   • _______________________________________________
   • _______________________________________________

4. METRICS CHECK (5 min)
   ──────────────────────
   Appointments since last call: ___
   Intakes completed: ___
   Payments processed: ___
   Any errors or downtime? [Y/N — details]

5. ACTION ITEMS (5 min)
   ─────────────────────
   What I'll do before next call:
   ☐ [Bug/fix/improvement — target date]
   ☐ [Bug/fix/improvement — target date]

   What they'll do:
   ☐ [Adoption push / staff reminder / try a new feature]

   Next call: [Date + Time]
══════════════════════════════════════════════════════════
```

### Async Feedback (Between Calls)

Encourage pilots to send feedback between calls. Set up a simple channel:

- **Option A:** Shared Google Doc per pilot — they add notes as they encounter things
- **Option B:** Email thread — they reply with observations as they happen
- **Option C:** Slack/WhatsApp group (if pilot is comfortable) — quick async questions

> **Rule:** Acknowledge all async feedback within 24 hours, even if just "Got it — I'll look
> into this and we'll discuss on our next call."

### Deep-Dive Review Template (Month 3, 45-60 min)

```
══════════════════════════════════════════════════════════
DEEP-DIVE REVIEW — [Clinic Name]
Date: [Date] | Duration: [Actual]

1. METRICS COMPARISON (15 min)
   ────────────────────────────
   Compare baseline → current for all metrics (Part 6).
   What improved? What didn't? Why?
   Notes: _____________________________________________

2. PAIN-POINT AUDIT (15 min)
   ────────────────────────
   Review the original pain points from their pilot record:
   • Pain point 1: [Resolved? Partially? Still open?]
   • Pain point 2: [Resolved? Partially? Still open?]
   • Pain point 3: [Resolved? Partially? Still open?]
   
   Any NEW pain points discovered? ____________________

3. FEATURE REVIEW (10 min)
   ────────────────────────
   Which features do they use daily? _________________
   Which features do they ignore? ____________________
   What feature would make the biggest difference? ____

4. TESTIMONIAL CHECK (5 min)
   ─────────────────────────
   "Would you be willing to share a quick quote about
   your experience for our marketing materials?"
   [Y/N — if Y, collect quote or schedule time]

5. CONVERSION PREVIEW (5 min)
   ─────────────────────────
   "At Month 6, the free period ends. I want to make
   sure you're getting enough value that you'd want to
   continue. What would make this a no-brainer yes?"
   Notes: _____________________________________________
══════════════════════════════════════════════════════════
```

### Pilot Review & Conversion Conversation (Month 6, 45-60 min)

```
══════════════════════════════════════════════════════════
PILOT REVIEW & CONVERSION — [Clinic Name]
Date: [Date] | Duration: [Actual]

1. FULL METRICS REVIEW (15 min)
   Present the complete baseline → Month 6 comparison.
   Quantify time saved, cost saved, no-show reduction.

2. CASE STUDY (10 min)
   • Can we feature [Clinic Name] as a case study?
   • Collect testimonial quote (written or video).
   • Ask for 1-2 referrals to other clinic owners.

3. PRICING CONVERSATION (15 min)
   Present pricing:
     Connect: $49-99/mo
     Intelligence add-on: $99-199/mo
   Offer pilot discount: 20% off first year.
   
   Response: [Yes / Thinking / No]
   If yes: Set up Stripe subscription.
   If thinking: Schedule follow-up in 2 weeks.
   If no: Graceful exit — thank them, ask for feedback on why.

4. ROADMAP SHARING (5 min)
   Share upcoming features based on their feedback.
   "Here's what we're building next, informed by your input."
══════════════════════════════════════════════════════════
```

---

## Part 8: Feedback Log Template

Maintain a single feedback log across all pilots. Use a spreadsheet with one row per feedback item.

### Feedback Log Structure

| ID | Date | Clinic | Category | Feedback | Priority | Status | Resolution | Action Date |
|----|------|--------|----------|----------|----------|--------|------------|-------------|
| 001 | 2026-06-15 | Glow Aesthetics | Bug | Intake form signature not saving on iPad Safari | Critical | Fixed | Added touch event handler | 2026-06-15 |
| 002 | 2026-06-15 | Glow Aesthetics | Feature | Want to add custom field "Treatment Area" to intake | Medium | Queued | Added to Phase 6 backlog | 2026-06-20 |
| 003 | 2026-06-16 | Vitality Med | Improvement | Payment link should auto-copy to clipboard | Low | Fixed | Added copy button | 2026-06-17 |
| ... | ... | ... | ... | ... | ... | ... | ... | ... |

### Categories

| Category | Description | Response Time |
|----------|-------------|---------------|
| **Bug** | Something broken or not working as expected | Same day (critical), within week (minor) |
| **Feature** | Something new they wish existed | Evaluate monthly, log for roadmap |
| **Improvement** | Something that works but could be better | Batch into next sprint (1-2 weeks) |
| **Question** | How do I...? | Answer within 24 hours |
| **Complaint** | General frustration (not a specific bug) | Acknowledge within 24 hours, investigate |

### Priority Levels

| Priority | Criteria |
|----------|----------|
| **Critical** | Blocks daily usage, data loss, payment failure |
| **High** | Significantly impacts workflow, affects multiple staff |
| **Medium** | Annoying but workaround exists |
| **Low** | Nice-to-have polish |

### Status Values

`New` → `Triaged` → `In Progress` → `Fixed` → `Verified` → `Closed`
`New` → `Triaged` → `Queued` → `Planned` → `Closed` (for feature requests)

### Close-the-Loop Rule

For every feedback item that gets resolved:
1. **Tell the pilot who reported it** — "Hey [Name], the issue you reported with [X] is fixed. Can you verify?"
2. **Mark as Verified** once they confirm
3. **Mark as Closed** only after verification

---

## Part 9: Phase 5 Gate Check

### Phase 5 → Phase 6+ (Expansion) Gate Criteria

All of the following must be true to exit Phase 5:

#### Product Readiness
- [ ] **No critical bugs** blocking daily usage at any pilot clinic
- [ ] **Intake completion rate >80%** (patients filling intakes before appointments)
- [ ] **Payment webhook success ~100%** (all payments correctly tracked)
- [ ] **All original pilot pain points addressed** (from pilot records in Part 2)

#### Adoption
- [ ] **3+ pilots onboarded** with the finished product
- [ ] **2+ pilots using weekly** without hand-holding
- [ ] **Each pilot has a portal champion** who can train new staff independently

#### Revenue
- [ ] **$500+ MRR** (Connect subscriptions from converted pilots)
- [ ] **At least 1 pilot converted** to paying customer
- [ ] **Pricing page live** with self-service signup

#### Intelligence
- [ ] **ML models trained** on real usage data (churn, LTV, demand forecasting)
- [ ] **ML insights surfaced** in at least 1 pilot's dashboard
- [ ] **Pilot feedback on ML insights** collected (useful or not)

#### Documentation & Case Studies
- [ ] **1+ case study written** from pilot data (baseline → improvement metrics)
- [ ] **1+ testimonial collected** (written or video)
- [ ] **Clear feature roadmap** derived from real customer feedback

### Gate Decision

**If ALL criteria met:**
> Proceed to Phase 6+ (Expansion). Scale outreach with case studies and testimonials. Add new
> verticals. Grow revenue.

**If SOME criteria missed:**
> Stay in Phase 5. Focus on the gaps. Common scenarios:
> - Low adoption → More training, simplify workflows, address friction points
> - No conversions → Pricing too high? Not enough value perceived? Extend free period.
> - ML not trained → Need more usage data. Give it another 4-6 weeks.
> - Bugs blocking usage → Prioritize fixes above everything else.

**If GATE FUNDAMENTALLY MISSED (product doesn't work for real clinics):**
> The product needs rethinking based on real-world feedback. This is valuable data — don't
> force scaling. Go back to Phase 1 for targeted rebuilds of the most critical gaps.

---

> **Related Documents:**
> - [Phase 5 Process Guide](Phase%20%26%20Build%20Docs/Phase%205%20-%20Customer%20Onboarding/Process.md) — Strategic overview of Phase 5
> - [Phase 5 Planning Doc](Phase%20%26%20Build%20Docs/Phase%205%20-%20Customer%20Onboarding/Phase%205%20-%20Customer%20Onboarding.md) — Objectives, gate criteria, revenue projections
> - [Cold Outreach Playbook](COLD_OUTREACH_PLAYBOOK.md) — 6-channel outreach templates
> - [Pilot Leads & Templates](PILOT_LEADS_AND_TEMPLATES.md) — 50+ verified leads
> - [Phase 1 Staging Deploy Guide](PHASE_1_STAGING_DEPLOY.md) — Staging deploy (Phase 1 prerequisite)
> - [MASTER_PROGRESS.md](MASTER_PROGRESS.md) — Single source of truth for project status
