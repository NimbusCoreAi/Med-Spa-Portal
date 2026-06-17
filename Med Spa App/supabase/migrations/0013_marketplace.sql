-- Migration: 0013_marketplace.sql
-- Marketplace tables for third-party module distribution with 20% take-rate.

-- ─── Marketplace Modules ──────────────────────────────────────

CREATE TABLE IF NOT EXISTS marketplace_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  author_id UUID NOT NULL,
  vertical TEXT,
  category TEXT NOT NULL DEFAULT 'other',
  pricing_model TEXT NOT NULL DEFAULT 'free',
  price_cents INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft',
  latest_version TEXT DEFAULT '0.1.0',
  install_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Module Versions ──────────────────────────────────────────

CREATE TABLE IF NOT EXISTS marketplace_module_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES marketplace_modules(id) ON DELETE CASCADE,
  version TEXT NOT NULL,
  changelog TEXT,
  manifest JSONB NOT NULL,
  published_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(module_id, version)
);

-- ─── Subscriptions ────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS marketplace_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL,
  module_id UUID NOT NULL REFERENCES marketplace_modules(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  activated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  cancelled_at TIMESTAMPTZ,
  UNIQUE(clinic_id, module_id)
);

-- ─── Indexes ──────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_mm_status ON marketplace_modules(status);
CREATE INDEX IF NOT EXISTS idx_mm_vertical ON marketplace_modules(vertical);
CREATE INDEX IF NOT EXISTS idx_mm_category ON marketplace_modules(category);
CREATE INDEX IF NOT EXISTS idx_ms_clinic ON marketplace_subscriptions(clinic_id);
CREATE INDEX IF NOT EXISTS idx_ms_module ON marketplace_subscriptions(module_id);
CREATE INDEX IF NOT EXISTS idx_ms_status ON marketplace_subscriptions(status);

-- ─── RLS Policies ─────────────────────────────────────────────

ALTER TABLE marketplace_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_module_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_subscriptions ENABLE ROW LEVEL SECURITY;

-- Published modules visible to all authenticated users
CREATE POLICY "modules_public_read" ON marketplace_modules
  FOR SELECT USING (status = 'published');

-- Authors can manage their own modules
CREATE POLICY "modules_author_write" ON marketplace_modules
  FOR ALL USING (author_id = auth.uid());

-- Published versions visible to all
CREATE POLICY "versions_public_read" ON marketplace_module_versions
  FOR SELECT USING (true);

-- Subscriptions: clinics can see and manage their own
CREATE POLICY "subscriptions_clinic_access" ON marketplace_subscriptions
  FOR ALL USING (
    clinic_id IN (
      SELECT id FROM clinics WHERE owner_id = auth.uid()
      UNION
      SELECT clinic_id FROM staff WHERE email = auth.email()
    )
  );

-- ─── Helper: increment install count ──────────────────────────

CREATE OR REPLACE FUNCTION increment_install_count(p_module_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE marketplace_modules
  SET install_count = install_count + 1, updated_at = NOW()
  WHERE id = p_module_id;
END;
$$ LANGUAGE plpgsql;
