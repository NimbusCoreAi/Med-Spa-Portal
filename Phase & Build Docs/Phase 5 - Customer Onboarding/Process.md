# Phase 5: Customer Onboarding — Process Guide

> **🔧 MAINTENANCE:** For current status, see [`../../MASTER_PROGRESS.md`](../../MASTER_PROGRESS.md). After completing any milestone or sub-phase, update it: (1) "At a Glance" table, (2) check off "What's Left" items, (3) add commit to "Build Log".

**Goal:** Deploy to production, recruit pilot clinics, onboard them with the finished product, collect feedback, train ML models, and generate revenue.

**Prerequisite:** Phases 1-4 are complete. The platform is fully built, tested, open-sourced, and polished.

> **AI-accelerated:** Timelines below are logical groupings, not calendar estimates. With the
> product already built, Phase 5 is primarily human-driven (outreach, calls, relationship
> management) and moves at the speed of customer adoption.

---

## Step 1: Production Deploy Preparation

> **Manual steps:** See [`../../PHASE_5_ONBOARDING_GUIDE.md`](../../PHASE_5_ONBOARDING_GUIDE.md) Part 3.

The staging deployment from Phase 1 proved the app works. Now deploy to production with real integrations.

- [ ] Switch Stripe from Test Mode to Live Mode (production keys)
- [ ] Upgrade Supabase from Free tier to Pro (required for production traffic)
- [ ] Upgrade Twilio from Trial to paid account (removes trial restrictions)
- [ ] Configure production Postmark sender domain (DKIM verified)
- [ ] Update all Vercel environment variables to production values
- [ ] Set up production Stripe webhook endpoint with live signing secret
- [ ] Update Supabase Auth URLs to production domain
- [ ] Enable email confirmation (now that server-side signup exists from Phase 2)
- [ ] Run full smoke test against production deployment
- [ ] Commit: `git commit -m "chore: production deploy configuration"`

---

## Step 2: Pilot Recruitment

> **Outreach templates:** See [`../../COLD_OUTREACH_PLAYBOOK.md`](../../COLD_OUTREACH_PLAYBOOK.md) and [`../../PILOT_LEADS_AND_TEMPLATES.md`](../../PILOT_LEADS_AND_TEMPLATES.md).

Use the cold outreach playbook (6 channels) to recruit 3+ committed pilot clinics from the 50+ verified leads.

### Recruitment Workflow

- [ ] Segment the 50+ leads by region, owner type, and clinic size
- [ ] Select 15-20 warmest prospects for initial outreach
- [ ] Execute multi-touch sequences (email-led, social-led, or call-led per lead)
- [ ] Conduct 15-minute discovery calls with interested clinics
- [ ] Qualify: Do they have the pain points? Will they commit to biweekly feedback? Can they start within 2 weeks?
- [ ] Secure firm commitments from 3+ clinics (verbal or written)

### Pilot Agreement Terms

| Term | Detail |
|------|--------|
| **Cost to clinic** | Free through at least Month 6 |
| **Commitment** | 20-30 min feedback call every 2 weeks |
| **Ideal mix** | Small/medium clinics, mix of injectable/wellness services |
| **Ideal diversity** | At least 1 current Mindbody user + 1 current Vagaro user |

### Recording Pilot Details

> **Template:** See [`../../PHASE_5_ONBOARDING_GUIDE.md`](../../PHASE_5_ONBOARDING_GUIDE.md) Part 2.

For each committed pilot, record:
- Clinic name, owner name, email, phone
- Current software (Mindbody, Vagaro, paper, etc.)
- Main pain points (from discovery call notes)
- Number of providers, staff, and approximate patient volume
- Kickoff call date
- Primary contact for technical questions

---

## Step 3: Per-Clinic Onboarding Sequence (4-Touch)

> **Detailed scripts & templates:** See [`../../PHASE_5_ONBOARDING_GUIDE.md`](../../PHASE_5_ONBOARDING_GUIDE.md) Part 4.

Each pilot clinic goes through a structured 4-touch onboarding sequence. Space touches 2-5 days apart depending on clinic availability.

### Touch 1: Kickoff Call (30-45 min)

**Goal:** Get the clinic set up and confident.

- [ ] Create clinic account via production signup (owner credentials)
- [ ] Walk through dashboard overview
- [ ] Configure clinic settings (name, location, services offered)
- [ ] Add all providers (names, roles, schedule templates)
- [ ] Add all rooms/treatment spaces
- [ ] Verify the owner can log in and navigate independently

### Touch 2: Data Setup Call (30-45 min)

**Goal:** Get real data flowing into the system.

- [ ] Import or manually add existing patients (name, email, phone minimum)
- [ ] Set up service catalog (treatment types, durations, pricing)
- [ ] Configure intake forms (select fields, add consent text)
- [ ] Test intake form flow end-to-end with a real or test patient
- [ ] Verify Stripe payment link generation works for their account

### Touch 3: Patient Flow Walkthrough (30-45 min)

**Goal:** Prove the full patient journey works for their clinic.

- [ ] Walk through the complete patient flow:
  1. Patient books appointment (via booking page or staff-created)
  2. Patient receives booking confirmation (email + SMS)
  3. Patient completes digital intake form before appointment
  4. Patient arrives, appointment shows on dashboard
  5. Payment link generated and sent
  6. Payment processed, status updated
  7. Follow-up notification sent
- [ ] Identify any clinic-specific workflow adjustments needed
- [ ] Confirm staff knows how to check patients in and process payments

### Touch 4: Week 2 Check-in (20-30 min)

**Goal:** Ensure adoption, address friction.

- [ ] Review usage: How many appointments created? Intakes completed? Payments processed?
- [ ] Address any blockers or confusion
- [ ] Collect initial feedback on what's working and what's not
- [ ] Confirm the biweekly feedback call schedule

---

## Step 4: Staff Training

> **Training guide:** See [`../../PHASE_5_ONBOARDING_GUIDE.md`](../../PHASE_5_ONBOARDING_GUIDE.md) Part 5.

Each pilot's staff needs to be comfortable using the portal independently.

- [ ] Create staff accounts for each team member (role-appropriate: owner, staff)
- [ ] Provide a 15-20 minute live walkthrough for all staff (group session)
- [ ] Cover daily workflows: checking the dashboard, managing appointments, processing payments, viewing intake forms
- [ ] Share a quick-reference guide (1-page cheat sheet of common actions)
- [ ] Confirm each staff member can log in and perform their core tasks
- [ ] Identify a "portal champion" at each clinic — the go-to person for questions

---

## Step 5: Baseline Metrics Recording

> **Template:** See [`../../PHASE_5_ONBOARDING_GUIDE.md`](../../PHASE_5_ONBOARDING_GUIDE.md) Part 6.

Before the pilot starts using the portal for real patients, record their baseline metrics. This lets you measure improvement.

For each pilot clinic, record:

| Metric | Baseline (Before Portal) | Target (With Portal) |
|--------|--------------------------|----------------------|
| No-show rate | ___% | <10% |
| Intake completion before appointment | ___% | >80% |
| Avg time to collect payment | ___ days | <2 days |
| Time spent on admin/scheduling per day | ___ hours | <50% of baseline |
| Patient booking method | Phone/Walk-in/Other | Online + Phone |
| Software tools used (count) | ___ | 1 (portal) |
| Monthly software cost | $___ | $0 (pilot) |

---

## Step 6: Feedback Collection & Iteration

> **Templates & cadence:** See [`../../PHASE_5_ONBOARDING_GUIDE.md`](../../PHASE_5_ONBOARDING_GUIDE.md) Part 7-8.

### Feedback Cadence

| When | What | Duration |
|------|------|----------|
| Week 2 | First check-in (Touch 4 above) | 20-30 min |
| Biweekly (Weeks 4, 6, 8...) | Structured feedback call | 20-30 min |
| Ongoing | Async feedback via email/Slack | As needed |
| Month 3 | Deep-dive review (all metrics) | 45-60 min |
| Month 6 | Pilot review + conversion conversation | 45-60 min |

### Feedback Triage Process

For every piece of feedback received:

1. **Log it** in the feedback log (structured: pain point, feature request, or bug)
2. **Classify:**
   - **Bug** → Fix immediately (same day if critical, within week if minor)
   - **Low-effort improvement** → Batch into next sprint (1-2 week turnaround)
   - **Medium feature** → Evaluate against other requests, prioritize monthly
   - **Large feature** → Log for Phase 6+ roadmap, communicate timeline to pilot
3. **Close the loop** — tell the pilot who reported it what happened (fixed, queued, or logged)

### Feedback Call Structure (20-30 min)

> **Full template:** See [`../../PHASE_5_ONBOARDING_GUIDE.md`](../../PHASE_5_ONBOARDING_GUIDE.md) Part 7.

1. **What's working well?** (5 min)
2. **What's frustrating or confusing?** (10 min)
3. **What's missing?** (5 min) — Features they wish existed
4. **Metrics check** (5 min) — Usage stats since last call
5. **Action items** (5 min) — What you'll fix before next call

---

## Step 7: ML Model Training

With real usage data flowing from pilot clinics, the ML models scaffolded in Phase 3 can now be trained.

> **Prerequisite:** 3+ clinics actively using the portal for at least 4-6 weeks of real data.

- [ ] Collect training data from pilot usage (appointments, no-shows, payments, patient behavior)
- [ ] Train churn prediction model (which patients are likely to leave)
- [ ] Train LTV (lifetime value) model (projected revenue per patient)
- [ ] Train demand forecasting model (predict appointment volume by day/time)
- [ ] Validate model accuracy against pilot data
- [ ] Surface ML insights in the dashboard for pilot clinics
- [ ] Collect feedback on ML insight usefulness

> **Note:** 50+ clinics is recommended for best model accuracy. With only 3 pilots, models will
> be directional — improve as the customer base grows.

---

## Step 8: Revenue Conversion

### Pilot → Paying Customer

At Month 4-5 of the pilot (leaving 1-2 months of free period as buffer):

- [ ] Schedule conversion conversation with each pilot owner
- [ ] Present metrics: time saved, no-show reduction, payment speed improvement
- [ ] Introduce pricing:
  - **Connect:** $49-99/mo (core portal: scheduling, intake, payments, notifications)
  - **Intelligence add-on:** $99-199/mo (ML insights, churn prediction, demand forecasting)
- [ ] Offer early-adopter discount (e.g., 20% off first year for pilot clinics)
- [ ] Secure commitment or graceful exit

### Second Outreach Round

With 3+ pilot references and real case studies:

- [ ] Update outreach materials with pilot testimonials and metrics
- [ ] Launch second cold outreach round targeting 20-30 new clinics
- [ ] Offer pilot-to-customer case studies as social proof
- [ ] Target: 5-7 new paying customers from second round

### Launch Pricing Tiers

- [ ] Publish public pricing page
- [ ] Configure Stripe subscription products in production
- [ ] Build self-service signup flow (if not already from Phase 2)
- [ ] Set up billing automation (invoice generation, payment retry, dunning)

---

## Step 9: Gate Check

**Phase 5 → Phase 6+ (Expansion) gate criteria:**

All of the following must be true:
- [ ] **3+ pilots onboarded** with the finished product
- [ ] **2+ pilots using weekly** without hand-holding
- [ ] **No critical bugs** blocking daily usage
- [ ] **Intake completion rate >80%** (patients filling intakes before appointments)
- [ ] **Payment webhook success ~100%**
- [ ] **$500+ MRR** (Connect subscriptions from converted pilots)
- [ ] **ML models trained** on real usage data
- [ ] **Clear list of next features** from real feedback

**If gate missed:** Iterate on customer feedback — the product needs refinement based on real usage. Do not force scaling.

**If gate passed:** Proceed to Phase 6+ (Expansion) — scale outreach, add verticals, grow revenue.

---

## Summary: Phase 5 Artifacts You'll Have

By end of Phase 5:

- ✅ Production deployment with real integrations (Stripe live, Supabase Pro, Twilio paid)
- ✅ 3+ pilot clinics actively using the portal with real patients
- ✅ Baseline + improvement metrics for each pilot
- ✅ Structured feedback log with triaged action items
- ✅ ML models trained on real data (churn, LTV, demand)
- ✅ $500+ MRR from converted pilots
- ✅ Case studies and testimonials for scaling outreach
- ✅ Public pricing page and self-service signup
- ✅ Clear roadmap of features driven by real customer feedback
