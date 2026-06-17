> **⚠️ STATUS NOTE:** This doc is stale. For current project status, see [`../../MASTER_PROGRESS.md`](../../MASTER_PROGRESS.md)
>
> **🔧 MAINTENANCE:** After completing any sub-phase described in this document, update [`../../MASTER_PROGRESS.md`](../../MASTER_PROGRESS.md): (1) update the "At a Glance" table, (2) check off completed items, (3) add the commit hash to the "Build Log" table. This is mandatory after every sub-phase completion or significant commit.

# Phase 1: Med Spa Portal - Build Guide Part 2
## Phases 1C & 1D: Portal Setup + Core Features

**Phases:** 1C (Week 4), 1D (Weeks 5-8)  
**Duration:** 5 weeks total  
**Purpose:** Build React portal + intake forms + scheduling + payments  
**AI Agent Type:** Full-stack feature development

---

> **Status:** See `../../MASTER_PROGRESS.md` for current status.

**Note for AI agents:** the `agentsystem-core` plugin skills referenced below (`add-feature`, `write-tests`, `frontend-design`, `verification-before-completion`, etc.) ARE installed and available in this environment. Invoke them with the `Skill` tool by name (or `/skill-name` in the interactive CLI). See the "NOTE FOR AI AGENTS: Skill Availability" section near the top of `PHASE_1_BUILD_GUIDE.md` for how to find/invoke skills and the fallback mapping to `superpowers` skills if one is ever missing. Each phase section below also has its own "Skills for this phase" quick-reference line.

---

# PHASE 1C: Portal Frontend Setup (Week 4)
## Initialize Next.js Portal App + UI Component Library

**Duration:** 1 week  
**Goal:** Set up portal frontend, create UI component library, implement authentication UI

**Skills for this phase:** `add-feature`, `frontend-design`, `write-tests`, `verification-before-completion`. See "NOTE FOR AI AGENTS: Skill Availability" in `PHASE_1_BUILD_GUIDE.md` for how to invoke these and the fallback mapping.

---

## Task 1C.1: Initialize Next.js Portal App

**Skills to Use:**
1. `/skill add-feature` (for app scaffolding)
2. `/skill frontend-design` (for UI architecture)

**What to Build:**
Next.js app in `apps/portal-medspa/`

**Detailed Steps:**

1. Create `apps/portal-medspa/package.json`:
   ```json
   {
     "name": "portal-medspa",
     "version": "0.1.0",
     "scripts": {
       "dev": "next dev",
       "build": "next build",
       "test": "jest",
       "lint": "eslint ."
     },
     "dependencies": {
       "next": "^14.0.0",
       "react": "^18.2.0",
       "react-dom": "^18.2.0",
       "@supabase/supabase-js": "^2.38.0",
       "@baseplate/core": "*",
       "@baseplate/ui": "*"
     },
     "devDependencies": {
       "typescript": "^5.0.0",
       "tailwindcss": "^3.3.0",
       "postcss": "^8.4.0",
       "autoprefixer": "^10.4.0"
     }
   }
   ```

2. Create Next.js configuration:
   - `apps/portal-medspa/next.config.js`
   - `apps/portal-medspa/tsconfig.json`
   - `apps/portal-medspa/tailwind.config.js`

3. Create directory structure:
   ```
   apps/portal-medspa/
   ├── src/
   │   ├── app/
   │   │   ├── page.tsx (home)
   │   │   ├── layout.tsx
   │   │   ├── auth/
   │   │   │   ├── login/
   │   │   │   ├── signup/
   │   │   │   └── layout.tsx
   │   │   ├── dashboard/
   │   │   │   ├── page.tsx
   │   │   │   ├── layout.tsx
   │   │   │   └── [clinic-id]/
   │   │   └── api/
   │   │       ├── auth/route.ts
   │   │       └── middleware.ts
   │   ├── components/
   │   │   ├── auth/
   │   │   ├── forms/
   │   │   ├── layout/
   │   │   └── dashboard/
   │   ├── hooks/
   │   ├── utils/
   │   └── styles/
   ├── public/
   └── jest.config.js
   ```

---

## Task 1C.2: Create UI Component Library

**Skills to Use:**
1. `/skill frontend-design` (for component design)
2. `/skill add-feature` (for component implementation)

**What to Build:**
Reusable UI components in `packages/ui/`

**Detailed Steps:**

1. Create `packages/ui/package.json`:
   ```json
   {
     "name": "@baseplate/ui",
     "version": "0.1.0",
     "exports": {
       "./button": "./src/button.tsx",
       "./input": "./src/input.tsx",
       "./form": "./src/form.tsx",
       "./table": "./src/table.tsx",
       "./modal": "./src/modal.tsx",
       "./layout": "./src/layout.tsx"
     },
     "dependencies": {
       "react": "^18.2.0",
       "clsx": "^2.0.0"
     },
     "devDependencies": {
       "typescript": "^5.0.0",
       "tailwindcss": "^3.3.0"
     }
   }
   ```

2. Create base components:
   - `packages/ui/src/button.tsx` — Reusable button component
   - `packages/ui/src/input.tsx` — Text input component
   - `packages/ui/src/form.tsx` — Form wrapper component
   - `packages/ui/src/table.tsx` — Data table component
   - `packages/ui/src/modal.tsx` — Modal/dialog component
   - `packages/ui/src/layout.tsx` — Layout wrapper component

3. Example button component:
   ```typescript
   // packages/ui/src/button.tsx
   import React from 'react';
   import clsx from 'clsx';
   
   interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
     variant?: 'primary' | 'secondary' | 'danger';
     size?: 'sm' | 'md' | 'lg';
   }
   
   export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
     ({ variant = 'primary', size = 'md', className, ...props }, ref) => {
       return (
         <button
           ref={ref}
           className={clsx(
             'font-semibold rounded transition',
             {
               'bg-blue-600 text-white hover:bg-blue-700': variant === 'primary',
               'bg-gray-200 text-gray-900 hover:bg-gray-300': variant === 'secondary',
               'bg-red-600 text-white hover:bg-red-700': variant === 'danger',
               'px-3 py-1 text-sm': size === 'sm',
               'px-4 py-2 text-base': size === 'md',
               'px-6 py-3 text-lg': size === 'lg',
             },
             className
           )}
           {...props}
         />
       );
     }
   );
   
   Button.displayName = 'Button';
   ```

---

## Task 1C.3: Implement Authentication UI

**Skills to Use:**
1. `/skill add-feature` (for auth pages)
2. `/skill frontend-design` (for form design)
3. `/skill write-tests` (for form tests)

**What to Build:**
Login and signup pages in portal

**Detailed Steps:**

1. Create `apps/portal-medspa/src/app/auth/login/page.tsx`:
   ```typescript
   'use client';
   
   import { useState } from 'react';
   import { login } from '@baseplate/core/auth';
   import { Button } from '@baseplate/ui/button';
   import { Input } from '@baseplate/ui/input';
   
   export default function LoginPage() {
     const [email, setEmail] = useState('');
     const [password, setPassword] = useState('');
     const [error, setError] = useState('');
     const [loading, setLoading] = useState(false);
     
     async function handleLogin(e: React.FormEvent) {
       e.preventDefault();
       setLoading(true);
       setError('');
       
       try {
         await login({ email, password });
         // Redirect to dashboard (next step)
       } catch (err) {
         setError(err instanceof Error ? err.message : 'Login failed');
       } finally {
         setLoading(false);
       }
     }
     
     return (
       <div className="min-h-screen flex items-center justify-center">
         <form onSubmit={handleLogin} className="w-full max-w-md space-y-4">
           <h1 className="text-2xl font-bold">Login</h1>
           
           <Input
             type="email"
             placeholder="Email"
             value={email}
             onChange={(e) => setEmail(e.target.value)}
           />
           
           <Input
             type="password"
             placeholder="Password"
             value={password}
             onChange={(e) => setPassword(e.target.value)}
           />
           
           {error && <div className="text-red-600">{error}</div>}
           
           <Button type="submit" disabled={loading} className="w-full">
             {loading ? 'Logging in...' : 'Login'}
           </Button>
         </form>
       </div>
     );
   }
   ```

2. Create signup page similarly in `apps/portal-medspa/src/app/auth/signup/page.tsx`

3. Create auth layout in `apps/portal-medspa/src/app/auth/layout.tsx`:
   ```typescript
   export default function AuthLayout({ children }: { children: React.ReactNode }) {
     return (
       <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
         {children}
       </div>
     );
   }
   ```

---

## Task 1C.4: Create Middleware

**Skills to Use:**
1. `/skill add-feature` (for middleware)

**What to Build:**
Authentication middleware for protected routes

**Detailed Steps:**

1. Create `apps/portal-medspa/src/middleware.ts`:
   ```typescript
   import { NextRequest, NextResponse } from 'next/server';
   import { createClient } from '@supabase/supabase-js';
   
   export async function middleware(request: NextRequest) {
     const supabase = createClient(
       process.env.NEXT_PUBLIC_SUPABASE_URL!,
       process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
     );
     
     const { data: { session } } = await supabase.auth.getSession();
     
     // Redirect to login if not authenticated
     if (!session && request.nextUrl.pathname.startsWith('/dashboard')) {
       return NextResponse.redirect(new URL('/auth/login', request.url));
     }
     
     return NextResponse.next();
   }
   
   export const config = {
     matcher: ['/dashboard/:path*']
   };
   ```

---

## Task 1C.5: Verify Frontend Setup

**Skills to Use:**
1. `/skill verification-before-completion`

**What to Verify:**
- [x] Next.js app initializes
- [x] TypeScript compiles
- [x] UI components export correctly
- [x] Auth pages load
- [x] No TypeScript errors
- [x] Components work with Tailwind

---

## Phase 1C Summary

**Deliverables:**
- ✅ Next.js portal app initialized
- ✅ UI component library set up
- ✅ Auth pages (login, signup)
- ✅ Middleware for protected routes
- ✅ All TypeScript compiles

**What's Ready for Phase 1D:**
- Portal frontend ready
- Next: Intake forms + scheduling + payments

---

---

# PHASE 1D: Core Portal Features (Weeks 5-8)
## Build Intake Forms, Scheduling, Payments

**Duration:** 4 weeks  
**Goal:** Build all core portal features needed for Phase 5 pilot onboarding

**Skills for this phase:** `add-feature`, `write-tests`, `frontend-design`, `verification-before-completion`. See "NOTE FOR AI AGENTS: Skill Availability" in `PHASE_1_BUILD_GUIDE.md` for how to invoke these and the fallback mapping.

---

## Task 1D.1: Create Intake Form Feature (Week 5)

**Skills to Use:**
1. `/skill add-feature` (for form feature)
2. `/skill write-tests` (for form tests)
3. `/skill frontend-design` (for form UX)

**What to Build:**
- Intake form builder (admin)
- Intake form submission (patient)
- Intake status tracking (staff)

**Detailed Steps:**

1. Create form builder schema in `packages/core/src/types/`:
   ```typescript
   export interface FormField {
     id: string;
     label: string;
     type: 'text' | 'textarea' | 'checkbox' | 'select' | 'date';
     required: boolean;
     options?: string[];
   }
   
   export interface IntakeForm {
     id: string;
     clinic_id: string;
     name: string;
     fields: FormField[];
     created_at: Date;
   }
   ```

2. Create intake submission schema:
   ```typescript
   export interface IntakeSubmission {
     id: string;
     clinic_id: string;
     patient_id: string;
     form_id: string;
     responses: Record<string, any>;
     signed_consent: boolean;
     signed_at?: Date;
     created_at: Date;
   }
   ```

3. Create form builder page in portal:
   - `apps/portal-medspa/src/app/dashboard/forms/[clinic-id]/page.tsx`
   - Allow clinic admin to create/edit form fields
   - Preview form before saving

4. Create patient intake page:
   - `apps/portal-medspa/src/app/patient/intake/[form-id]/page.tsx`
   - Display form fields from builder
   - Collect responses
   - Digital signature for consent
   - Submit to database

5. Create staff dashboard component:
   - Show intake completion status for upcoming appointments
   - Color-coded: not started (red), in progress (yellow), completed (green)

---

## Task 1D.2: Create Scheduling Feature (Weeks 5-6)

**Skills to Use:**
1. `/skill add-feature` (for scheduling)
2. `/skill write-tests` (for scheduling tests)

**What to Build:**
- Real-time calendar with conflict prevention
- Provider + room assignment
- Self-service patient booking

**Database Schema:**

```sql
-- Providers
CREATE TABLE providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID REFERENCES clinics(id),
  name VARCHAR(255),
  specialties TEXT[],
  availability JSONB, -- { "monday": ["09:00-17:00"] }
  created_at TIMESTAMP
);

-- Treatment Rooms
CREATE TABLE rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID REFERENCES clinics(id),
  name VARCHAR(255),
  capacity INT,
  created_at TIMESTAMP
);

-- Appointments
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID REFERENCES clinics(id),
  patient_id UUID REFERENCES patients(id),
  provider_id UUID REFERENCES providers(id),
  room_id UUID REFERENCES rooms(id),
  scheduled_time TIMESTAMP,
  duration_minutes INT,
  status VARCHAR(50), -- 'scheduled', 'completed', 'cancelled'
  intake_completed BOOLEAN DEFAULT FALSE,
  payment_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP
);

-- Add constraint to prevent double-booking
ALTER TABLE appointments ADD CONSTRAINT no_provider_conflicts
  EXCLUDE USING GIST (
    provider_id WITH =,
    tsrange(scheduled_time, scheduled_time + (duration_minutes || ' minutes')::INTERVAL) WITH &&
  );
```

**Features:**

1. Staff calendar view:
   - Week/month view
   - See all appointments
   - See provider + room for each
   - Conflict detection (visual highlight if conflict)

2. Patient self-booking:
   - Select treatment type
   - Choose provider (optional)
   - Select available time slots
   - Confirm appointment

3. Appointment confirmation:
   - Email + SMS sent to patient
   - Link to intake form
   - Payment link (Week 6)

---

## Task 1D.3: Create Payments Integration (Weeks 6-7)

**Skills to Use:**
1. `/skill add-feature` (for payments)
2. `/skill write-tests` (for payments tests)

**What to Build:**
- Stripe integration
- Payment link generation
- Payment status tracking
- Webhook handling

**Detailed Steps:**

1. Create Stripe integration in `packages/integrations/stripe/`:
    ```typescript
    // packages/integrations/stripe/index.ts
    import Stripe from 'stripe';
    
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    
    export async function createPaymentLink(params: {
      clinicId: string;
      patientId: string;
      appointmentId: string;
      amount: number;
      description: string;
    }) {
      const link = await stripe.paymentLinks.create({
        line_items: [{
          price_data: {
            currency: 'usd',
            product_data: { name: params.description },
            unit_amount: params.amount * 100 // cents
          },
          quantity: 1
        }],
        metadata: {
          clinic_id: params.clinicId,
          patient_id: params.patientId,
          appointment_id: params.appointmentId
        }
      });
      
      return link;
    }
    
    export async function handleWebhook(req: Request) {
      const sig = req.headers.get('stripe-signature')!;
      const body = await req.text();
      
      const event = stripe.webhooks.constructEvent(
        body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
      
      // Handle payment completion via PaymentIntent
      if (event.type === 'payment_intent.payment_failed') {
        // Log failure for retry
      }

      // For payment links, Stripe creates a PaymentIntent when the patient
      // checks out. Listen for payment_intent.succeeded to confirm payment.
      if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const appointmentId = paymentIntent.metadata.appointment_id;
        
        if (appointmentId) {
          // Update appointment payment status in database
          // await markAppointmentPaid(appointmentId);
        }
      }
      
      return new Response('OK');
    }
    ```

    **Note:** Stripe Payment Links create a Checkout Session, which in turn creates a PaymentIntent. The webhook should listen for `payment_intent.succeeded` (not `payment_link.created`, which fires when the link itself is created — not when payment is received). See the Stripe docs on [Payment Links webhooks](https://stripe.com/docs/payments/payment-links/webhooks) for details.

2. Add payment fields to appointment:
   - `payment_status` (pending, completed, failed)
   - `payment_link_url`
   - `payment_completed_at`

3. Create payment page in portal:
   - Staff can generate payment link
   - Show payment status
   - Webhook updates status automatically

---

## Task 1D.4: Add Notifications Infrastructure (Week 7)

**Skills to Use:**
1. `/skill add-feature` (for notifications)

**What to Build:**
- Email notification system
- SMS notification system

**In `packages/integrations/`:**

1. Create `postmark/` for emails:
   ```typescript
   import { ServerClient } from 'postmark';
   
   const client = new ServerClient(process.env.POSTMARK_API_TOKEN!);
   
   export async function sendEmail(params: {
     to: string;
     subject: string;
     htmlBody: string;
   }) {
     return client.sendEmail({
       From: process.env.POSTMARK_FROM_EMAIL!,
       To: params.to,
       Subject: params.subject,
       HtmlBody: params.htmlBody
     });
   }
   ```

2. Create `twilio/` for SMS:
   ```typescript
   import twilio from 'twilio';
   
   const client = twilio(
     process.env.TWILIO_ACCOUNT_SID!,
     process.env.TWILIO_AUTH_TOKEN!
   );
   
   export async function sendSMS(params: {
     to: string;
     body: string;
   }) {
     return client.messages.create({
       from: process.env.TWILIO_PHONE_NUMBER!,
       to: params.to,
       body: params.body
     });
   }
   ```

---

## Task 1D.5: Build Reporting Dashboard (Week 8)

**Skills to Use:**
1. `/skill frontend-design` (for dashboard design)
2. `/skill add-feature` (for dashboard)

**What to Build:**
- Revenue dashboard
- Appointment stats
- No-show rate
- Intake completion rate

**Metrics to Show:**
- Total revenue (this month, YTD)
- Number of appointments (scheduled, completed, cancelled)
- No-show rate (%)
- Intake completion rate (%)
- Revenue by provider (table)
- Treatment popularity (chart)

---

## Task 1D.6: Deploy to Staging (Vercel)

**Skills to Use:**
1. `/skill add-feature` (for deployment config)

**What to Build:**
- Vercel staging deployment
- Environment configuration (staging keys)
- SSL certificates
- Database backups

**Steps:**

1. Deploy to Vercel (staging — do NOT use `--prod`):
   - Connect GitHub repo
   - Set environment variables (staging)
   - Deploy portal-medspa app to staging

2. Set up Supabase backups:
   - Enable daily backups
   - Test restore process

---

## Task 1D.7: Module Gaps + Architecture Fixes + Staging Deploy

> **Note:** Customer onboarding deferred to Phase 5. This task is pure build completion.

**Skills to Use:**
1. `/ship` (route to correct skill for each extraction)
2. `/skill verification-before-completion` (final verification)

**What to Do:**

1. Close module library gaps (AI-accelerated):
   - [ ] `packages/core/errors` — structured error handling
   - [ ] `packages/core/bookings` — booking orchestration
   - [ ] `packages/core/availability` — pure slot calculation engine
   - [ ] `@baseplate/hooks` — useApiQuery / useApiMutation
   - [ ] `@baseplate/next-api` — route handler + middleware factories
   - [ ] `packages/core/notifications` — notification orchestration
   - [ ] `packages/core/utils` — shared utilities
   - [ ] `@baseplate/dates` — date utilities
   - [ ] `packages/patterns/form-builder` — extract from app
   - [ ] `packages/patterns/consent-form` — extract from app

2. Fix architecture:
   - [ ] RBAC on all dashboard routes
   - [ ] Extract clinicId from session (remove NEXT_PUBLIC_CLINIC_ID)
   - [ ] Migrate to @supabase/ssr session-aware client
   - [ ] Unify Supabase client pattern across modules
   - [ ] Split scheduling/ module into 4 sub-modules

3. Resolve HIPAA + security:
   - [ ] BAA with Supabase OR restrict intake fields
   - [ ] Stripe webhook error handling improvements

4. Staging deploy + smoke test:
   - [ ] Deploy to Vercel staging
   - [ ] Verify full happy path end-to-end
   - [ ] Login/signup, booking, intake, payment, notifications all working

---

## Phase 1D Summary

**Deliverables:**
- ✅ Intake form builder + submission
- ✅ Real-time scheduling with conflict prevention
- ✅ Stripe payment integration
- ✅ Email + SMS notifications
- ✅ Reporting dashboard
- ✅ Deployment config
- ✅ Module library gaps closed
- ✅ Architecture fixed (RBAC, multi-tenant, session-aware)
- ✅ HIPAA resolved
- ✅ Staging smoke test passed

---

---

# PHASE 1 COMPLETION CHECKLIST

**By end of Phase 1, verify:**

## Infrastructure ✅
- [ ] Monorepo initialized
- [ ] Supabase database configured
- [ ] GitHub repo set up
- [ ] CI/CD pipeline configured

## Core Modules (packages/core/) ✅
- [ ] Auth module (login, signup, logout)
- [ ] RBAC module (permissions checking)
- [ ] Audit logs module (logging, retrieval)
- [ ] Encryption module (encrypt/decrypt)
- [ ] All modules >80% test coverage
- [ ] All modules documented
- [ ] ZERO med spa specific code

## Integration Modules (packages/integrations/) ✅
- [ ] Stripe integration (payment links)
- [ ] Postmark integration (email)
- [ ] Twilio integration (SMS)
- [ ] Webhook handler

## UI Components (packages/ui/) ✅
- [ ] Button, Input, Form, Table, Modal
- [ ] Layout components
- [ ] All components Tailwind-styled
- [ ] Responsive design verified

## Portal App (apps/portal-medspa/) ✅
- [ ] Next.js app initialized
- [ ] Auth pages (login, signup)
- [ ] Intake form builder + submission
- [ ] Scheduling with conflict prevention
- [ ] Payment link generation
- [ ] Notification sending
- [ ] Dashboard with metrics
- [ ] Deployed to Vercel staging

## Module Library Gaps ✅
- [ ] Error handling module extracted
- [ ] Booking orchestration module extracted
- [ ] Availability/slot engine extracted
- [ ] React hooks package created
- [ ] Next.js API factories created
- [ ] Notifications orchestration module extracted
- [ ] Date utilities package created
- [ ] FormBuilder moved to patterns
- [ ] ConsentForm pattern extracted

## Architecture ✅
- [ ] RBAC enforced on ALL dashboard routes
- [ ] clinicId extracted from session (no hardcoding)
- [ ] Session-aware client (@supabase/ssr)
- [ ] Supabase client pattern unified
- [ ] scheduling/ split into sub-modules

## Security & Compliance ✅
- [ ] HIPAA posture resolved (BAA or field restrictions)
- [ ] Stripe webhook error handling improved
- [ ] All API routes have authorization checks

## Testing ✅
- [ ] All modules >80% test coverage
- [ ] All features manually tested
- [ ] No TypeScript compilation errors
- [ ] No console errors in browser
- [ ] Mobile responsive verified
- [ ] Staging smoke test passed (full happy path)

---

# Phase 1 → Phase 2 Gate Criteria

To proceed to Phase 2, VERIFY ALL:

1. **All features built and tested** (149+ tests, 0 failures) ✅
2. **Module library gaps closed** (all extractions complete) ✅
3. **RBAC complete** (role checks on every protected route) ✅
4. **HIPAA resolved** (compliance posture documented) ✅
5. **Multi-tenant isolation** (clinicId from session, not hardcoded) ✅
6. **Staging smoke test passes** (full happy path verified) ✅
7. **All modules documented + tested** (>80% coverage) ✅

**If all above pass: READY FOR PHASE 2**

---

# Next: Phase 2 — Platform Layer

Once Phase 1 is complete and all gate criteria are met, move to Phase 2:

**Phase 2 docs:**
- `../Phase 2 - Platform Layer/Phase 2 - Platform Layer.md`
- `../Phase 2 - Platform Layer/Process.md`

- Generalize all modules (remove med spa specifics)
- Open-source launch on GitHub
- Extract Stripe/Postmark/Twilio integrations as Connect APIs

