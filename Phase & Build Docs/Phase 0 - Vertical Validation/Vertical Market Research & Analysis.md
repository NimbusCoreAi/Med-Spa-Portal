# Vertical Market Research & Analysis

> **Reference for Phase 0 & Phase 1:** Use this document to validate your vertical choice before proceeding with production code. All data current as of 2025-2026.

---

## Executive Summary

This document provides market-validated data on 10 B2B SaaS vertical candidates for Baseplate. Each is scored across 6 dimensions: market size, current tool landscape, pain points, willingness to pay, integration complexity, and competitive intensity.

**Bottom line:** Three verticals stand out as strong entry points (Tier 1). The rest are viable but require deeper specialization or niche positioning.

---

## TIER 1: STRONG YES ✅

These verticals have the best combination of growth, pain points, willingness to pay, and manageable competition.

---

### 1. Med Spas / Wellness Clinics 🏆 (HIGHEST RECOMMENDATION)

**Recommendation:** **YES** — Highest growth, acute pain, strong willingness to pay, moderate competition

#### Market Size & Growth
- **TAM:** $384.7M (2025) → $1.47B (2035)
- **Number of Businesses:** 10,488–42,622 (varies by definition: physician-supervised vs. aesthetic clinics)
- **Growth Rate:** 14.4% CAGR (fastest among all verticals researched)

#### Current Tool Landscape
| Vendor | Type | Pricing | Key Features |
|---|---|---|---|
| Mindbody | General wellness/beauty | $30–$300/mo | Booking, scheduling, payment processing |
| Vagaro | Beauty/aesthetics | $30–$300/mo | Appointment scheduling, payments |
| PatientNow / EnvisionNow | Clinical + billing | $150–$300/mo | EMR, invoicing, patient portal |
| Zenoti | Wellness + business management | $50–$200/mo | Bookings, POS, customer loyalty |
| Square | POS + payments | Pay-per-transaction | Payments only (no EMR or booking) |
| AestheticsPro | Clinic-specific | $99–$199/mo | Clinical workflows, before/after photos |
| ClinikEHR | Healthcare-specific EMR | $100–$500/mo | Clinical notes, HIPAA compliance |

**Key Issue:** No single vendor solves both clinical (EMR) + business (booking + payments) in one HIPAA-compliant platform. Clinics juggle 2–3 tools.

#### Top Pain Points
1. **Tool juggling (CRITICAL):** Clinical data in EMR, booking in Mindbody, payments in Square → clinicians switching between systems
2. **HIPAA compliance gap:** Most solutions not HIPAA-eligible; photo storage & patient records scattered across non-compliant tools (legal liability)
3. **Integration friction:** Mindbody doesn't sync with HIPAA EMR or SMS automation
4. **Clinician burnout:** Non-clinical staff spending time on tech instead of serving clients
5. **Regulatory/consent management:** Manual consent form collection; no digital workflows

#### Willingness to Pay
- **$150–$300/month** for all-in-one (clinical + booking + payments)
- Price-sensitive market (AestheticsPro aggressively locked in 2025 pricing in Dec 2025)
- High switching costs once integrated (3–6 months of data entry to migrate)

#### Integration Complexity
- **High:** 6–8+ integrations required
  - Payment processors (Stripe, Square)
  - HIPAA-compliant EMR or clinical templates
  - Photo storage (HIPAA-compliant, e.g., AWS BAA)
  - Digital consent forms (eSign or custom)
  - SMS/email automation (Twilio, Postmark)
  - Marketing automation (optional: MailChimp, Klaviyo)

#### Competitive Intensity
- **Moderate-High:** 10+ vendors but fragmentation by use case
- Mindbody dominant in fitness/wellness but not optimized for medical workflows
- No clear winner in "clinical + business + payments all-in-one"
- Opportunity exists for purpose-built clinic solution

#### Why This Wins
1. **Fastest growth:** 14.4% CAGR vs. 2–10% for other verticals
2. **Acute pain:** HIPAA liability is non-negotiable; clinics desperately need integrated solution
3. **High willingness to pay:** $150–$300/month is strong commitment
4. **Sticky:** HIPAA compliance + integrated workflows = high switching cost
5. **Underserved:** Existing solutions not purpose-built for medical workflows

#### Primary Wedge
**HIPAA-compliant all-in-one:** Appointment booking + digital intake forms + clinical note templates + payment processing + automated SMS reminders.

**Why this wedge:**
- Solves the tool-juggling problem immediately
- Eliminates manual consent form collection
- Integrates payments so clinicians see money without separate Square dashboard
- HIPAA compliance reduces clinic's legal risk (huge value prop)

#### How to Validate (Phase 0)
- Find 5+ med spa / wellness clinic owners
- Ask: "Walk me through how you manage: (1) patient intake, (2) appointment scheduling, (3) payment processing, (4) follow-up reminders. What tools do you use for each?"
- If they name 3+ different tools and say "it's a mess," → gate passed ✅

---

### 2. Home Service Businesses (Plumbing, HVAC, Cleaning)

**Recommendation:** **YES** — Large market, acute QB integration pain, underserved below ServiceTitan tier

#### Market Size & Growth
- **TAM:** $152B (HVAC alone)
- **Number of Businesses:** 120,461 HVAC contractors + 990,000+ plumbing & HVAC establishments combined
- **Growth Rate:** 8–10% CAGR (labor shortages driving tech adoption)

#### Current Tool Landscape
| Vendor | Type | Pricing | Key Features | Market Position |
|---|---|---|---|---|
| ServiceTitan | Comprehensive field service | $250–$400/tech/month | Dispatch, invoicing, QB integration, job costing | Market leader (mid-market) |
| Housecall Pro | SMB-focused FSM | $69–$169/month | Scheduling, invoicing, payments, basic QB | SMB leader |
| FieldEdge | Field service + CRM | $150–$300/month | Dispatch, invoicing, native QB integration (best-in-class) | Niche for complex jobs |
| Jobber | Freelancer to 10 techs | $29–$99/month | Scheduling, quotes, invoicing | SMB/solo option |
| Workiz | Simple scheduling | $45–$95/month | Scheduling, SMS, basic invoicing | Budget option |
| Square | Payment processing | 2.9% + $0.30 per transaction | Payments only (no QB sync) | Payments only |
| Stripe | Payment processing | 2.9% + $0.30 per transaction | Payments only (no QB sync) | Payments only |
| QuickBooks | Accounting | $15–$50/month | Invoicing, expense tracking, P&L | Accounting (no field features) |

**Key Issue:** QB doesn't natively sync with Square/Stripe. When a technician collects $500 payment via Square, the accountant must manually enter it in QB → duplicate data entry, errors, reconciliation nightmare.

#### Top Pain Points
1. **QuickBooks integration gap (CRITICAL):** Stripe/Square don't sync to QB → technician enters invoice in FSM, accountant enters in QB. Double data entry, reconciliation hell.
2. **Dispatch bottlenecks:** Lost invoices, poor technician visibility, scheduling friction
3. **Underserved below ServiceTitan:** ServiceTitan starts at $2M revenue; under that, options are limited
4. **Labor tracking:** No easy payroll + benefits integration
5. **Equipment management:** Tracking tools, parts, vehicle costs not in FSM software
6. **QB pricing hike resentment:** Intuit raised QB 15–20% in July 2025; support declined

#### Willingness to Pay
- **Small teams (1–5 techs):** $100–$200/month
- **Mid-market (10+ techs):** $250–$400/month (ServiceTitan tier)
- **Price elasticity:** Willing to pay for QB integration that eliminates duplicate data entry

#### Integration Complexity
- **High:** 6–8 integrations
  - QuickBooks (critical)
  - Payment processors (Stripe, Square)
  - Payroll (ADP, Guidepoint)
  - SMS/email (Twilio, Postmark)
  - Dispatch/routing (Google Maps API)
  - Parts/inventory management (optional)

#### Competitive Intensity
- **Moderate:** 4–6 strong vendors
- ServiceTitan dominates high-end ($2M+ revenue)
- Housecall Pro strong for SMBs ($69–$169/month)
- Jobber/Workiz for freelancers/solo
- **Gap exists:** $200–$300/month tier underserved (above Housecall Pro, below ServiceTitan)

#### Why This Wins
1. **Large, fragmented market:** 990K+ businesses; not consolidated around one platform
2. **Acute pain:** QB integration gap is real; teams spend hours on manual reconciliation
3. **Pricing hike resentment:** Intuit's 15–20% QB hike in July 2025 creates window for alternatives
4. **Strong willingness to pay:** Willing to pay $150–$300/month to eliminate QB hassle
5. **Underserved tier:** Nothing good between Housecall Pro ($69/mo, limited) and ServiceTitan ($250+/mo)

#### Primary Wedge
**Scheduling + field service management + native QuickBooks sync** (eliminating duplicate data entry).

**Why this wedge:**
- QB integration is the #1 pain point teams mention
- Native sync eliminates most painful manual work (accountant data entry)
- Applies to all home service types (plumbing, HVAC, cleaning, electrical)
- Clear ROI: "3 hours/week saved on QB reconciliation × $50/hour = $150/week savings"

**Secondary wedge (Month 2):** Add SMS reminders to reduce no-shows (20–30% no-show rate in home services).

#### How to Validate (Phase 0)
- Find 5+ HVAC/plumbing/cleaning business owners
- Ask: "How do you handle the connection between your scheduling software and QuickBooks? Is it manual or automatic?"
- If they say "manual" or "uses Zapier but it's clunky," → gate passed ✅
- Bonus validation: "How much time per week does your accountant spend entering invoices into QB?"

---

### 3. Contractor Management (General/Specialty Contractors)

**Recommendation:** **YES** — Fast growth, acute QB pain (especially post-July 2025 hike), job costing gap

#### Market Size & Growth
- **TAM (narrower):** $3.2B (2024) → $8.1B (2033)
- **TAM (broader, all construction):** $10.62B (2025) → $17.81B (2031)
- **Number of Businesses:** 125K HVAC-focused; 600K+ including all contractors
- **Growth Rate:** 10.8% CAGR (digital transformation in construction)

#### Current Tool Landscape
| Vendor | Type | Pricing | Key Features | Best For |
|---|---|---|---|---|
| Procore | Construction management | $400–$1200+/month | Project management, RFIs, change orders, reporting | Large contractors, general contractors |
| UDA ConstructionOnline | Project + accounting | $200–$500/month | Job costing, estimating, QB integration | Mid-market general contractors |
| Jobber | Freelancer/small team | $29–$99/month | Scheduling, invoicing | Small teams under 5 |
| Joist | Estimating + invoicing | $29–$149/month | Quotes, invoicing, simple tracking | Solopreneurs, small contractors |
| BuildSafe | Safety management | $100–$300/month | Safety tracking, incident reporting | Safety-focused contractors |
| QuickBooks | Accounting | $15–$50/month | Invoicing, expense tracking, P&L | Accounting (no construction features) |
| Microsoft Project / Smartsheet | Project management | $300+/month | Gantt charts, resource planning | Large-scale project tracking |

**Key Issue:** QB lacks job costing, equipment tracking, subcontractor management, change orders, retention tracking—the bread and butter of contractor accounting.

#### Top Pain Points
1. **QuickBooks gap (CRITICAL):** QB lacks:
   - Job costing (can't track profit per job)
   - Equipment tracking (can't allocate truck, tools, equipment costs to jobs)
   - Subcontractor management (no way to track subcontractor billings, retentions, payments)
   - Change orders (manual tracking outside QB)
   - Retention tracking (percentage hold-back on subcontractor payments)
2. **QB pricing hike resentment (JULY 2025):** Intuit raised QB 15–20%; support declined
3. **Equipment management:** Forced to spreadsheets (vehicles, tools, equipment not in any system)
4. **Subcontractor billing complexity:** Change orders, retentions, approval workflows not in QB
5. **Field team friction:** QB too complex for field workers to understand
6. **Data silos:** Procore (for project management) vs. QB (for accounting) don't talk

#### Willingness to Pay
- **Small teams (1–3 crew):** $100–$250/month
- **Mid-market (10+ crew):** $250–$500+/month
- **Willingness increases if it:** Eliminates QB and replaces it entirely, OR adds job costing + equipment tracking without QB

#### Integration Complexity
- **Very High:** 7–10+ integrations
  - QuickBooks (critical, though could replace it)
  - Payment processors (Stripe, Square, Stripe Connect for subcontractor payouts)
  - Payroll (ADP, Guidepoint)
  - SMS/email (Twilio, Postmark)
  - Equipment/tool tracking (custom or Bridger)
  - Permits/licensing (varies by region)
  - Insurance/bonding (integration optional)
  - Lender portals (if job financing involved)

#### Competitive Intensity
- **Moderate:** 5–8 strong platforms
- Procore dominates mid/large market ($400+/month)
- Gap below Procore: Jobber/Joist for under $150/month lack job costing
- **Opportunity:** $200–$400/month tier with QB replacement + job costing

#### Why This Wins
1. **Fast growth:** 10.8% CAGR (highest among "B2B admin" verticals)
2. **Acute pain:** QB gaps + recent pricing hike create resentment
3. **Willingness to pay:** Strong ($200–$400/month) if solution cuts QB entirely + adds job costing
4. **Underserved:** Nothing good between Jobber ($99/mo, simple) and Procore ($400+/mo, complex)
5. **Specialization possible:** Could focus on specific type (general contractors vs. specialty trades)

#### Primary Wedge
**Job costing + equipment tracking + native QuickBooks sync** (or QB replacement).

**Why this wedge:**
- Job costing is the #1 thing contractors complain QB can't do
- Eliminates manual spreadsheet tracking of profit per job
- Equipment tracking provides visibility on biggest asset (vehicles, tools)
- Clear ROI: "Know if Job #42 is actually profitable (not just invoiced)"

**Secondary wedge:** Subcontractor billing workflow (change orders, retentions, approval).

#### How to Validate (Phase 0)
- Find 5+ general/specialty contractors
- Ask: "How do you know if a specific job was profitable? What's your process?"
- If they say "hope QB reconciles it monthly" or "pull a P&L and guess," → gate passed ✅
- Bonus: "Do you use equipment on multiple jobs? How do you track equipment costs per job?"

---

## TIER 2: MAYBE 🤔

These verticals have potential but require deeper specialization or face stronger competition.

---

### 4. Tattoo / Piercing Studios

**Recommendation:** **MAYBE** — Low competition, clear pain points, but small market and lower willingness to pay

#### Market Size & Growth
- **TAM:** $123.5M (2024) → $250M (2033)
- **Number of Businesses:** 25,874–28,711 registered; likely 50K+ including home studios
- **Growth Rate:** 8.5% CAGR

#### Current Tool Landscape
| Vendor | Type | Pricing | Key Features |
|---|---|---|---|
| BookedIN | Appointment scheduling | $20–$60/month | Scheduling, SMS reminders, client portal |
| Kitomba | Salon/studio management | $30–$100/month | Scheduling, POS, inventory |
| Vagaro | Beauty/service scheduling | $30–$300/month | Booking, payments, marketing |
| Offshoot | Tattoo-specific | $80–$150/month | Scheduling, portfolio, SMS |
| Baxus | Tattoo studio software | $99–$199/month | Booking, artist portfolios, deposits |
| Simple Inked | Tattoo-specific | $50–$150/month | Scheduling, client intake, digital consent |
| DaySmart Body Art | Body art focused | $150–$250/month | Comprehensive studio management |

#### Top Pain Points
1. **Admin overhead:** Juggling email, Instagram, phone for bookings → context-switching nightmare
2. **No-show rate (CRITICAL):** 15–25% no-show rate; SMS reminders reduce this 20–25%
3. **Custom intake forms:** Design references (photos/sketches), skin conditions, medical history, allergies all required per appointment
4. **Multi-session booking:** Large pieces split across 3–5 visits; need to track which sessions completed
5. **Limited consent/waiver:** Digital consent forms (aftercare, liability) not in most platforms
6. **Artist portfolio:** Showing past work to clients not well-integrated into booking flow

#### Willingness to Pay
- **Single-artist studios:** $30–$75/month
- **Multi-artist shops:** $75–$200/month
- Price-sensitive; many solopreneurs use Calendly + Venmo

#### Integration Complexity
- **Low-Moderate:** 4–5 integrations
  - Payment processor (Stripe, Square)
  - SMS (Twilio, Postmark)
  - Email (Postmark, SendGrid)
  - Social media (Instagram integration for portfolio)
  - Optional: Digital consent (eSign or Docusign)

#### Competitive Intensity
- **Low-Moderate:** 7–10 vendors; Vagaro and Booksy dominant but not specialized
- No clear market leader in "tattoo-specific"
- Vagaro positioned as general beauty/service (not optimized for body art)
- Booksy strong in Europe/Asia; less penetration in US

#### Why This Could Work
1. **Low competition:** Smallest vendor count of Tier 1+2 verticals
2. **Clear pain points:** No-shows, custom intakes, multi-session tracking
3. **Community-driven:** "Built by tattoo artists for tattoo artists" has strong resonance
4. **Network effect:** Artist referrals, Instagram-native audience

#### Why It's Risky
1. **Small market:** 50K studios vs. 100K+ for other verticals
2. **Lower willingness to pay:** $30–$75/month vs. $150–$300 for med spas
3. **High churn risk:** Low switching friction (artists easily go to Calendly + Venmo)
4. **CAC challenge:** Reaching 50K tattoo studios is expensive (local, low-tech businesses)

#### Primary Wedge
**Scheduling + custom digital intake forms + SMS no-show reminders + digital consent/waivers.**

**Why this wedge:**
- Solves the #1 pain point: no-shows
- Custom intake forms reduce communication friction (clients submit design references, medical info upfront)
- Digital consent eliminates liability (signed consent on file)

#### How to Validate (Phase 0)
- Find 5+ tattoo/piercing studio owners
- Ask: "What's your biggest operational pain? How much time per week do you spend scheduling?"
- If they mention no-shows or say "I use Calendly + email + phone + Instagram," → gate passed ✅

---

### 5. Property Management (Small/Mid Landlords)

**Recommendation:** **MAYBE** — Large market, but incumbent solutions adequate; gap is narrow

#### Market Size & Growth
- **TAM:** $3.8–7.7B
- **Number of Businesses:** 370,900 taxpayers receiving rental income; 66% own 1–2 units
- **Growth Rate:** 6.4–10.1% CAGR through 2033

#### Current Tool Landscape
| Vendor | Type | Pricing | Key Features | Focus |
|---|---|---|---|---|
| AppFolio | Comprehensive PM | $60–$300+/month | Tenant screening, lease mgmt, payments, accounting | Mid-market (10-100 units) |
| Propertyware | PM focused | $20–$300/month | Lease management, maintenance, tenant portal | Small/mid-market |
| Landlord Studio | Simple PM | $20–$50/month | Basic lease mgmt, payment tracking | Solo landlords (1-5 units) |
| Rent Manager | Cloud-based PM | $50–$200/month | Comprehensive; per-property pricing | Small/mid-market |
| TurboTenant | Simple PM | $20–$50/month | Basic tenant mgmt, eSignature, payments | Solo/small (1-10 units) |
| Stripe | Payment collection | 2.9% + $0.30 | Payments only | Standalone |
| QuickBooks | Accounting | $15–$50/month | Invoicing, expense tracking | Accounting |

#### Top Pain Points
1. **Rent collection & late payments:** Critical friction; manual follow-up, chasing tenants
2. **Maintenance request management:** Tenant calls/emails scattered; no centralized triage
3. **Integration limitations:** Most platforms don't connect well (tenant portal → QuickBooks is manual)
4. **Feature bloat:** Landlord Studio, TurboTenant are simple; AppFolio has too much for 1–2 unit owners
5. **Pricing scalability:** Per-unit or per-property pricing scales poorly for small landlords
6. **Tenant screening:** Separate tool (TransUnion, Checkr); doesn't integrate with PM platform

#### Willingness to Pay
- **Solo/small landlords (1–5 units):** $20–$50/month (price-sensitive)
- **Mid-market (10–50 units):** $50–$150/month
- **Willing to pay more if:** Integrates with Stripe + QuickBooks (eliminates duplicate entry)

#### Integration Complexity
- **Moderate-High:** 4–6 integrations
  - Stripe or ACH processing
  - QuickBooks
  - Tenant screening (TransUnion, Checkr)
  - Email/SMS (Postmark, Twilio)
  - Maintenance dispatch (optional)
  - Accounting sync (critical)

#### Competitive Intensity
- **High:** 15–20+ established vendors
- AppFolio, Propertyware dominate
- Many incumbents serve small landlords adequately
- **Gap:** Micro-landlords (1–10 units) underserved; most solutions have unnecessary features

#### Why This Could Work
1. **Large market:** 370K+ landlords
2. **Real pain points:** Rent collection, integration friction
3. **Willing to switch:** If solution eliminates QB manual entry

#### Why It's Risky
1. **Intense competition:** 15–20+ vendors, many established for 10+ years
2. **Gap is narrow:** Existing solutions (Landlord Studio, TurboTenant) already address 1–5 unit landlords well
3. **Low willingness to pay:** $20–$50/month for small landlords; hard to build sustainable business
4. **Regulation risk:** Varies by state (lease laws, eviction rules)

#### Primary Wedge (if pursuing)
**Automated rent collection + late payment recovery + SMS reminders + QuickBooks sync.** Focus only on micro-landlords (1–10 units).

#### How to Validate (Phase 0)
- Find 5+ small landlords (1–10 units)
- Ask: "How much time per month do you spend chasing overdue rent? What's your biggest pain point?"
- If they say "I use a spreadsheet and chase tenants manually" and "QB reconciliation is a nightmare," → gate passed ✅

---

### 6. Fitness Studios / Gyms

**Recommendation:** **MAYBE** — Growing market, Mindbody backlash creating opportunity, but 50+ competitors

#### Market Size & Growth
- **TAM:** $1.2–2.23B (2026) → $3.5–4B (2033)
- **Number of Businesses:** 107,751 gyms & fitness studios in the US (1.1% growth, slowing)
- **Growth Rate:** 10–12% CAGR for software (market is growing, but studio count not)

#### Current Tool Landscape
| Vendor | Type | Pricing | Key Features | Market Position |
|---|---|---|---|---|
| Mindbody | Dominant | $99–$700+/mo (now "talk to sales") | Booking, payments, marketing, member portal | 50K+ studios; declining satisfaction post-acquisition |
| Perfect Gym Solutions | Gym-specific | $100–$300/month | Membership, scheduling, payments, reporting | Niche competitor |
| Glofox | Studio-focused | $99–$299/month | Class scheduling, member management, analytics | Growing in boutique |
| Zenoti | Wellness + business | $50–$200/month | Bookings, POS, loyalty, integrations | Multi-vertical (fitness, beauty, wellness) |
| Pike13 | Class scheduling | $80–$250/month | Member management, attendance tracking | Niche for small studios |
| Virtuagym | Fitness app + management | $50–$200/month | Workout plans, member tracking, mobile app | Fitness-focused |
| Trainerize | Trainer platform | $50–$150/month | Personal training, progress tracking, online coaching | Trainer/boutique focus |
| Mariana Tek | Boutique-specific | $99–$499/month | Class scheduling, member management, analytics | Strong in boutique (Pilates, Yoga) |
| Zen Planner | Martial arts/studios | $50–$150/month | Membership, billing, class scheduling | Martial arts + fitness studios |

#### Top Pain Points
1. **Mindbody pricing opacity (CRITICAL):** Removed pricing from website in 2026; costs escalate as studio grows
2. **Quality decline post-acquisition:** ABC Fitness acquired Mindbody (2024); support declined, app quality dropped
3. **Unnecessary features:** Mindbody feels over-built for small studios; too many feature flags
4. **Competitor innovation gap:** Mindbody hasn't delivered significant AI features despite hype
5. **Member retention:** No good AI-driven upsell/retention recommendations
6. **Pricing structure:** Per-location pricing, not per-business; multi-location studios pay 2x or 3x

#### Willingness to Pay
- **Single-location studio (50–200 members):** $100–$300/month
- **Multi-location:** $300–$700+/month (Mindbody charges per location)
- **Willingness to switch:** Yes, if transparent pricing + better support + AI features

#### Integration Complexity
- **Moderate:** 5–7 integrations
  - Stripe or Square (payments)
  - Email/SMS (Mailchimp, Klaviyo, Twilio)
  - Member portal (custom or third-party)
  - Payroll (ADP, Guidepoint)
  - Google Calendar or Outlook sync (optional)
  - Analytics/BI (optional: Mixpanel, Amplitude)

#### Competitive Intensity
- **Very High:** 50+ platforms competing
- Mindbody dominant despite quality issues (switching cost is high; 10+ years of data)
- Fragmentation by use case: boutique fitness (Mariana Tek strong), martial arts (Zen Planner), general gyms (Perfect Gym)
- Regional/branded players (F45, Orangetheory, Peloton) have proprietary systems

#### Why This Could Work
1. **Mindbody backlash:** Quality decline + pricing opacity = window for alternative
2. **Growing market:** 10–12% CAGR for software solutions
3. **Underserved segments:** Boutique fitness (Mariana Tek doing well), but general gym market is fragmented

#### Why It's Risky
1. **50+ competitors:** Fragmented but intense
2. **Mindbody's installed base:** Switching cost is high (10+ years of data, member history)
3. **Differentiation is hard:** Need to own specific segment (e.g., boutique Pilates studios) or solve one acute pain (AI retention)
4. **CAC is high:** Reaching studios requires local marketing, partner relationships

#### Primary Wedge (if pursuing)
**Transparent pricing + best-in-class AI-driven member retention + Stripe integration (no Square lock-in).**

**Why this wedge:**
- Addresses Mindbody pricing opacity directly
- AI retention is emerging pain point (studios want to reduce churn)
- Stripe integration gives flexibility (vs. Mindbody's Square bias)

**Strategic note:** Consider focusing on a specific sub-segment (e.g., Pilates studios, CrossFit boxes, martial arts) rather than competing head-to-head with Mindbody in general gym market.

#### How to Validate (Phase 0)
- Find 5+ studio owners
- Ask: "How happy are you with Mindbody? What would make you switch?"
- If multiple mention pricing hikes, declining support, or "looking for alternative," → gate passed ✅

---

### 7. Accounting / Bookkeeping Firms

**Recommendation:** **MAYBE** — Large market, QB resentment post-hike, but TaxDome already solving practice management

#### Market Size & Growth
- **TAM:** $19.38B (2024) → $31.25B (2030)
- **Number of Businesses:** 85,223 accounting services firms (down from 130K; market consolidating)
- **Growth Rate:** 8.4% annually; market consolidating (smaller firms acquired)

#### Current Tool Landscape
| Vendor | Type | Pricing | Key Features | Market Position |
|---|---|---|---|---|
| QuickBooks | Dominant accounting | $15–$50/month | Invoicing, expense tracking, P&L, basic tax prep | 62% market share; price hikes in July 2025 |
| Xero | Cloud accounting | $15–$50/month | Invoicing, reconciliation, integrations | #2 player; strong in Australia/NZ |
| TaxDome | Practice management | $100–$300+/month | Workflow automation, CRM, client portal, QB integration | Rising star; consolidating practice mgmt market |
| Zoho Books | Cloud accounting | $11–$50/month | Basic accounting, invoicing, expense tracking | Budget option; limited advanced features |
| FreshBooks | Invoicing-focused | $15–$50/month | Invoicing, time tracking, expense tracking | Solo freelancers/small teams |
| Wave | Free accounting | $0 (free) | Basic invoicing, accounting (very limited) | Budget; lacks features for firms |
| ProFile | Tax prep software | $200–$500/month | Tax return prep, planning, QB integration | Tax-specific; not for general bookkeeping |
| CCH | Tax software | $300–$1000+/year | Tax prep, compliance, planning | Enterprise; large firms only |

#### Top Pain Points
1. **Month-end close stretched over weeks:** Manual processes, multi-client reconciliation
2. **QuickBooks integration complexity:** QB doesn't sync well with 3rd-party tools; loose integrations abound
3. **QB pricing hikes (JULY 2025):** Intuit raised QB 15–20%; support declined
4. **Data entry across multiple client systems:** Each client uses different bookkeeping tools; accountants aggregate data
5. **Uncertain ROI on new tools:** Inadequate internal expertise to implement + train staff
6. **Pricing hikes resentment:** Firms looking for QB replacement

#### Willingness to Pay
- **Small team (1–3 bookkeepers):** $50–$100/person/month for specialized tools
- **Larger firms:** $150–$300/month for bundled solution (practice mgmt + CRM + automation)
- **Willing to abandon QB if:** Cloud alternative is reliable + integrations are solid + saves time on month-end

#### Integration Complexity
- **High:** 5–10 integrations
  - QuickBooks (though could replace it)
  - Tax software (ProFile, CCH)
  - Bank APIs (for reconciliation automation)
  - Email/document management (Postmark, OneDrive, Google Drive)
  - eSignature (DocuSign, Adobe Sign)
  - Client portal (custom or third-party)
  - Time tracking (optional)

#### Competitive Intensity
- **Very High:** 10+ major vendors
- QuickBooks dominates with 62% market share
- TaxDome rising in practice management space
- Consolidation happening (smaller vendors acquired)

#### Why This Could Work
1. **Large market:** $19.4B → $31.3B by 2030
2. **QB resentment:** July 2025 hike + support decline created window
3. **Month-end close pain:** Real, recurring pain point
4. **Time = money:** Firms willing to pay for automation that saves hours per week

#### Why It's Risky
1. **QB dominance:** 62% share; hard to displace
2. **TaxDome already winning:** Rising star in practice management + automation
3. **Consolidation trend:** Smaller firms acquired; customer base shrinking
4. **Long sales cycles:** Accountants slow to change; firm-wide decisions take months

#### Primary Wedge (if pursuing)
**AI-powered month-end close automation** (transaction categorization, reconciliation, variance analysis).

**Why this wedge:**
- Month-end close is the #1 time sink for firms
- AI can categorize transactions 10x faster than humans
- Exports clean, reconciled data to QB/Xero
- Clear ROI: "Save 40 hours/month on month-end = $3K savings for a 3-person firm"

**Strategic note:** Position as "QB replacement alternative" post-July-2025-hike, but be prepared for long enterprise sales cycle.

#### How to Validate (Phase 0)
- Find 5+ accounting/bookkeeping firm owners
- Ask: "How long does month-end close take? What's the most time-consuming part?"
- If they say "2–3 weeks" and "reconciliation is a nightmare," → gate passed ✅
- Bonus: "Did you consider switching away from QB after the July 2025 price hike?"

---

## TIER 3: NO ❌ (Avoid)

These verticals have structural challenges that make them poor entry points for Baseplate.

---

### 8. Real Estate Brokerages

**Recommendation:** **NO** — Integration complexity too high, incumbent lock-in strong, win rate low

#### Market Size & Growth
- **TAM:** $12.3B SaaS component; broader RE market $288B by 2035 (42% CAGR)
- **Number of Businesses:** 963,460 real estate sales & brokerage firms; 1.53M agents
- **Growth Rate:** 10.3–17.3% (real estate market growing, not SaaS adoption necessarily)

#### Current Tool Landscape
| Layer | Tools | Notes |
|---|---|---|
| **Brokerage/Franchise** | RE/MAX, Coldwell Banker, Keller Williams | Agents must use brokerage's system; minimal choice |
| **CRM for agents** | HubSpot, Pipedrive, Salesforce (RE-adapted), Follow Up Boss | But MLS integration varies; often manual |
| **MLS (property data)** | CRMLS (California), Zillow API, MLS-specific (varies by region) | Highly fragmented by state/region (NAR has 500+ local MLSs) |
| **Specialized tools** | Matterport (3D tours), LeadSnap, TourFactory | Point solutions; many separate integrations |
| **Accounting** | QuickBooks, often handled by brokerage | Brokerage handles money; agent deals with leads/closings |

#### Top Pain Points
1. **Lead follow-up consistency (CRITICAL):** Follow-ups are manual; many leads fall through cracks
2. **Disconnected systems:** Website → CRM not syncing kills conversions; manually adding leads
3. **MLS integration friction:** Manual property status checks; systems don't auto-update when property sells
4. **Time on admin:** Data entry duplication; leads entered in website, CRM, and MLS manually
5. **Regional MLS fragmentation:** NAR has 500+ local MLS systems; no single integration
6. **Data entry duplication:** Property info, agent info, client info entered in multiple systems

#### Willingness to Pay
- **Per-agent:** $100–$200/month for integrated CRM (but many pay through brokerage)
- **Brokerage level:** $500–$2000+/month for platform
- **Constraint:** Brokerage standardizes on one platform; agents have limited choice

#### Integration Complexity
- **Very High (BARRIER TO ENTRY):**
  - MLS integrations (500+ different MLSs, state-specific)
  - State-specific compliance (licensing, trust accounting rules)
  - Document signing (eSignature, closing coordination)
  - CRM (HubSpot, Salesforce compatibility)
  - Accounting (varies by brokerage; some use QB, some custom)
  - Lead routing (internal rules vary)
  - Compliance reporting (NAR, state-specific)

#### Competitive Intensity
- **Very High:** 20+ major platforms
- **Winner-take-most dynamics:** Brokerages standardize on one platform (RE/MAX, Keller Williams, etc.) that own the agent base
- **Consolidation:** Large brokerages own their own tech; franchisees have no choice

#### Why This Is NO
1. **MLS fragmentation is insurmountable:** 500+ local MLSs; each integration is a custom project
2. **Brokerage lock-in:** RE/MAX, Keller Williams, Coldwell Banker own agents directly; hard to reach
3. **Compliance complexity:** State-specific licensing, trust accounting rules require deep expertise
4. **Long sales cycles:** Real estate decisions are slow (3–12 months)
5. **Limited TAM for new entrant:** Consolidation means fewer independent brokerages; most are franchises owned by nationals

**Verdict:** Do not enter this vertical. Integration complexity is a moat that incumbent platforms have already paid to build.

---

### 9. Veterinary Clinics

**Recommendation:** **NO** — Slow growth, IDEXX dominance, small market, long sales cycles

#### Market Size & Growth
- **TAM:** Not disclosed but market is consolidating
- **Number of Businesses:** 57,920 veterinary services in the US
- **Growth Rate:** 2.9% annually (slow); market consolidating (independent practices acquired by corporate chains)

#### Current Tool Landscape
| Vendor | Type | Pricing | Key Features | Market Position |
|---|---|---|---|---|
| Cornerstone Software (IDEXX) | Legacy on-premise | $200–$500/month | Clinical management, invoicing, drug tracking | 40–50% of market; old system but deeply embedded |
| Avimark | Legacy on-premise | $200–$400/month | Clinical management, invoicing | Niche; shrinking |
| Neo (IDEXX) | Cloud-native | $100–$300/month | Clinical management, invoicing, IDEXX diagnostic integration | IDEXX's modernization play |
| ezyVet | Cloud-native | $100–$250/month | Clinic management, invoicing, integrations | Niche competitor; slower adoption |
| Vetsoftware | Legacy | $100–$200/month | Clinical management, invoicing | Regional player; shrinking |
| SimpleVet | Cloud-native | $50–$150/month | Basic clinic management | Small team focus |
| QuickBooks | Accounting | $15–$50/month | Invoicing, expense tracking | Separate system (not integrated) |

#### Top Pain Points
1. **IDEXX Neo ↔ QuickBooks gap (CRITICAL):** Neo handles clinical data; QB handles accounting; requires accountant to untangle
2. **Data mapping issues:** Lazy syncs dump every invoice into QB, bloating files and creating reconciliation nightmares
3. **Revenue discrepancies:** Invoiced vs. net after payment processing fees (Stripe, Square) not reconciled
4. **Inventory tracking:** Clinical inventory (IDEXX supplies) vs. vendor bills (QB) creates gaps
5. **Legacy system switching cost:** Cornerstone has 20+ years of data; migration is expensive

#### Willingness to Pay
- **Independent practices (1–5 vets):** $100–$300/month
- **Group practices (5+ locations):** $50–$200/month (volume discounts)
- **Constraint:** Practices are cost-sensitive; willing to stay on legacy systems if they work

#### Integration Complexity
- **Very High:** 8–10+ integrations
  - IDEXX diagnostics (hardware + software)
  - IDEXX imaging
  - QuickBooks
  - Payroll (ADP, Guidepoint)
  - Pet insurance APIs (Trupanion, nationwide, Banfield)
  - Payment processing (Stripe, Square, CareCredit)
  - SMS reminders (Twilio)
  - Email (Postmark)
  - Optional: Referral management (VetFolio)

#### Competitive Intensity
- **Low:** Only 3–4 major platforms (Cornerstone, Neo, ezyVet, Vetsoftware)
- **But:** IDEXX owns the ecosystem (hardware diagnostics, software, integrations)
- **Barrier:** Hard to dislodge IDEXX because vets have invested in hardware (diagnostics, digital radiography) that only works with IDEXX

#### Why This Is NO
1. **Slow growth:** 2.9% annually (vet services growing slowly)
2. **Small market:** 57,920 clinics (vs. 370K landlords, 990K home service businesses)
3. **IDEXX dominance:** Owns hardware (diagnostics), software (Neo), and integrations; hard to compete
4. **Long sales cycles:** Vet practice decision-making is slow (6–12 months)
5. **Cloud adoption slow:** Legacy installed base is large; Cornerstone still has 40–50% of market despite being on-premise

**Verdict:** Do not enter. IDEXX's ecosystem lock-in is too strong. The market is consolidating around corporate chains (Banfield, VEG, etc.) that use IDEXX exclusively.

---

### 10. Salons / Barbershops

**Recommendation:** **NO** — Massive market but stagnant growth, 10+ competitors, low willingness to pay

#### Market Size & Growth
- **TAM:** 712.86M (barbershops) + 1.17M hair salons = 1.17M total businesses
- **Market Size:** Barbershop software $712M–$1.2B in 2025
- **Number of Businesses:** 25,000–30,000 barbershops; 850,000+ hair salons
- **Growth Rate:** 0.8% annually (stagnant); market growing slower than overall GDP

#### Current Tool Landscape
| Vendor | Type | Pricing | Key Features | Market Position |
|---|---|---|---|---|
| Mindbody | Dominant | $99–$700+/month | Booking, payments, marketing, member portal | 30K+ salons/spas; declining satisfaction |
| Square Appointments | POS-integrated | $50–$200/month | Scheduling, payments (Square-native) | Growing; Stripe-compatible |
| Fresha | European-first | $30–$150/month | Booking, payments, team management | Strong in Europe/Asia; US growth |
| Booksy | Affordable focus | $10–$50/month | Booking, payments, SMS, online booking | Fast-growing; affordability positioning |
| Vagaro | General beauty | $30–$300/month | Booking, payments, inventory, POS | Multi-vertical (beauty, fitness, wellness) |
| StyleSeat | Freelancer-first | $25–$50/month | Booking, payments, portfolio | Freelance stylists / independent contractors |
| Zenoti | Wellness + business | $50–$200/month | Booking, POS, loyalty, advanced analytics | Multi-vertical; premium positioning |
| DaySmart Salon | Salon-focused | $100–$250/month | Comprehensive salon management | Niche; declining market share |

#### Top Pain Points
1. **Mindbody poor fit for hair salons:** Lacks color formula management, backbar inventory, fast checkout POS
2. **Limited no-show prevention:** Booksy addressing with deposits/cancellations, reducing no-shows 25%
3. **Inventory management weak:** Backbar products (shampoos, dyes, styling products) and retail not well-tracked
4. **Pricing/feature bloat:** Mindbody $2K–$7K annually; users avoid enterprise features
5. **Mobile app quality issues:** Mindbody post-acquisition bugs (2024 ABC Fitness acquisition)
6. **POS not optimized for high-volume:** Hair salons do 20–40 transactions per day; systems slow down

#### Willingness to Pay
- **Small barbershop/salon (1–3 chairs):** $20–$50/month
- **Larger salon (5+ chairs, retail inventory):** $75–$150/month
- **Very price-sensitive:** Many solopreneurs use Calendly (free) + Venmo (free)

#### Integration Complexity
- **Moderate:** 5–6 integrations
  - Payment processor (Stripe, Square, PayPal)
  - Email/SMS (Postmark, Twilio, Klaviyo)
  - Retail inventory (optional; most don't track)
  - POS (optional; some use Square POS)
  - Social media (Instagram integration for portfolio)

#### Competitive Intensity
- **Very High:** 10–15 major vendors
- Mindbody, Fresha, Booksy, Vagaro, Square Appointments all competing
- Consolidation happening (post-2024 ABC Fitness acquisition, Mindbody quality declined)
- **Fragmentation by positioning:** Mindbody (enterprise), Booksy (affordable), StyleSeat (freelance), Fresha (international)

#### Why This Is NO
1. **Stagnant growth:** 0.8% annually (salons are closing, not opening)
2. **Massive market but hard to reach:** 850K+ salons; CAC is high
3. **Low willingness to pay:** $20–$75/month makes it hard to build sustainable business
4. **High churn:** Low switching friction; salons easily abandon for cheaper alternative
5. **Intense competition:** 10+ strong vendors already serving this market
6. **Winner-take-most dynamics:** Mindbody dominates despite declining quality; switching inertia is high

**Verdict:** Do not enter. Market is stagnant, willingness to pay is low, and competition is intense. Even if you build a "better mousetrap," salons are price-sensitive and won't pay premium for features they don't use.

---

## Summary Table: All 10 Verticals

| Vertical | Recommendation | Market Size (2026) | Growth | Willingness to Pay | Competition | Pain Point Severity | Feasibility |
|---|---|---|---|---|---|---|---|
| **Med Spas** | **YES** | $384M–$1.5B | 14.4% | **$150–$300/mo** | Moderate | CRITICAL (HIPAA) | Easy (small market, standardizable workflows) |
| **Home Service** | **YES** | $152B+ | 8–10% | **$150–$300/mo** | Moderate | CRITICAL (QB sync) | Medium (HVAC specific variants) |
| **Contractors** | **YES** | $3.2–8.1B | 10.8% | **$200–$400/mo** | Moderate | CRITICAL (job costing) | Medium-Hard (complex workflows) |
| **Tattoo/Piercing** | MAYBE | $123M–$250M | 8.5% | $30–$100/mo | Low | High (no-shows, intakes) | Easy (simple workflows) |
| **Property Mgmt** | MAYBE | $3.8–7.7B | 6–10% | $30–$75/mo | High | Medium (rent collection) | Hard (intense competition) |
| **Fitness** | MAYBE | $1.2–2.2B | 10–12% | $100–$300/mo | Very High | Medium (Mindbody backlash) | Hard (50+ competitors) |
| **Accounting** | MAYBE | $19.4–31.3B | 8.4% | $50–$200/mo | Very High | High (month-end) | Hard (QB dominance, consolidating) |
| **Real Estate** | NO | $12.3B+ | 10–17% | $100–$200/mo | Very High | High (disconnected) | **IMPOSSIBLE** (MLS fragmentation) |
| **Veterinary** | NO | ~$57K clinics | 2.9% | $100–$300/mo | Low | High (IDEXX gap) | Hard (IDEXX moat, slow market) |
| **Salons** | NO | 1.17M businesses | 0.8% | $20–$75/mo | Very High | High (Mindbody) | **IMPOSSIBLE** (CAC too high) |

---

## How to Use This Document in Phase 0

1. **Pick one Tier 1 vertical** (Med Spas, Home Service, or Contractors)
   - Align with your domain expertise or existing network
   - Read the "Primary Wedge" section — that's your Phase 1 focus

2. **Run the Phase 0 validation** using the "How to Validate" guidance for your chosen vertical
   - Talk to 5+ business owners
   - Ask the specific questions listed
   - Look for the pain point to appear in 2+ conversations (gate criterion)

3. **Reference throughout Phase 1-3**
   - Integration complexity table → Tech stack decisions
   - Competitive landscape → Differentiation strategy
   - Willingness to pay → Pricing decisions
   - Pain points → Feature prioritization

4. **Revisit if gates are missed**
   - If Phase 0 gate fails (pain point doesn't validate), switch to Tier 2 vertical
   - If Phase 5 gate fails (can't get 10 customers), revisit competitive intensity and positioning

---

## Key Insights

1. **Tier 1 verticals have sweet spot:** $150–$400/month willingness to pay, 8–15% growth, moderate competition
2. **QB integration is a wedge across 3 verticals:** Home service, contractors, accounting all mention QB friction
3. **HIPAA compliance is unique moat:** Med spas benefit from regulatory stickiness that other verticals don't have
4. **Market size is not destiny:** Largest markets (salons, real estate) are hardest to win; medium markets (tattoo, contractors) are easier
5. **Avoid: MLS fragmentation, IDEXX dominance, stagnant growth, low willingness to pay** — all are structural moats for incumbents, not opportunities for new entrants

---

## References & Data Sources

- Property Management Software Market (Coherent Market Insights, 2025)
- Medical Spa Software Market (Market.us, 2025)
- Real Estate SaaS Market Growth (Technavio, 2025)
- Accounting Software Market Analysis (NerdWallet, 2025)
- Home Service Software Trends (ServiceTitan Blog, 2025)
- Veterinary Clinic Software (IBISWorld, 2025)
- Fitness Studio Management (Verified Market Reports, 2025)
- Tattoo Studio Software (Capterra, 2025)
- Contractor Management Software (Verified Market Reports, 2025)
- Salon & Barbershop Software (Fresha, Zenoti, 2025)
- Landlord Statistics (iPropertyManagement, 2026)
- Fitness Industry Statistics (Zippia, 2025)
