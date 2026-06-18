# Deployment Guide — Med Spa Portal

## Prerequisites

- Railway account
- Supabase project (production)
- Stripe account
- Postmark account
- Twilio account

## 1. Supabase Setup

1. Create a project at [supabase.com](https://supabase.com)
2. Run migrations in order:
   ```
   supabase/migrations/0001_init_clinics.sql
   supabase/migrations/0002_rls_policies.sql
   supabase/migrations/0003_intake_forms.sql
   supabase/migrations/0004_scheduling.sql
   supabase/migrations/0005_payments.sql
   supabase/migrations/0006_rename_treatment_to_service.sql
   supabase/migrations/0007_tighten_rls_policies.sql
   supabase/migrations/0008_staff_insert_policy.sql
   ```
3. Enable daily backups: Settings > Database > Daily Backups
4. Note the project URL and anon key from Settings > API

## 2. Railway Deployment

1. Push the repo to GitHub
2. Go to [railway.com](https://railway.com) → New Project → Deploy from GitHub repo
3. Set Root Directory to `Med Spa App/apps/portal-medspa` (so the pnpm workspace resolves)
4. Buildpack: Railway auto-detects Next.js via Nixpacks (no config file required)
5. Add all environment variables under Service → Variables (see below)
6. Deploy

> **HIPAA note:** Railway does **not** offer a HIPAA BAA. This deployment path is fine for dev/staging and early production with **no real PHI**. Before storing real patient data, migrate the app host to a BAA-signed provider (AWS/GCP/Azure).

## 3. Environment Variables

Set these in Railway → Service → Variables:

| Variable | Where to get it |
|----------|----------------|
| `NEXT_PUBLIC_APP_URL` | Your Railway domain (e.g. `https://your-app.up.railway.app`) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase > Settings > API > Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase > Settings > API > anon key |
| `SUPABASE_URL` | Same as NEXT_PUBLIC_SUPABASE_URL |
| `SUPABASE_ANON_KEY` | Same as NEXT_PUBLIC_SUPABASE_ANON_KEY |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase > Settings > API > service_role key |
| `STRIPE_SECRET_KEY` | Stripe Dashboard > Developers > API Keys |
| `STRIPE_WEBHOOK_SECRET` | Stripe Dashboard > Developers > Webhooks (see below) |
| `POSTMARK_API_TOKEN` | Postmark > Servers > API Tokens |
| `POSTMARK_FROM_EMAIL` | Verified sender email |
| `TWILIO_ACCOUNT_SID` | Twilio Console > Account Info |
| `TWILIO_AUTH_TOKEN` | Twilio Console > Account Info |
| `TWILIO_PHONE_NUMBER` | Twilio > Phone Numbers |

## 4. Stripe Webhook

1. In Stripe Dashboard, create a webhook endpoint:
   - URL: `https://your-app.up.railway.app/api/webhooks/stripe`
   - Events: `checkout.session.completed`, `payment_intent.payment_failed`
2. Copy the signing secret and set `STRIPE_WEBHOOK_SECRET` in Railway service variables

## 5. Post-Deploy Verification

- [ ] App loads at Railway URL
- [ ] Signup flow creates a clinic
- [ ] Login redirects to dashboard
- [ ] Dashboard shows metrics (may be zeros with no data)
- [ ] Provider/Room creation works
- [ ] Intake form builder saves
- [ ] Calendar shows appointments
- [ ] Stripe checkout link generates
- [ ] Audit logs page blocks non-owners

## 6. SSL

Automatic via Railway. No additional configuration needed.

## 7. Supabase Backups

- Daily automatic backups enabled by default on paid tiers
- For free tier, set up pg_dump cron or upgrade to Pro
- Test restore: Supabase > Database > Backups > Restore
