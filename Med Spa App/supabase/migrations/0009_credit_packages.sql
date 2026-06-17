-- Migration: 0009_credit_packages.sql
-- Credit packages: patients buy bundles of sessions (e.g., "3 Botox treatments")
-- Enables the package-deduct Connect API endpoint.

CREATE TABLE credit_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  service_type VARCHAR(100),
  total_sessions INTEGER NOT NULL CHECK (total_sessions > 0),
  remaining_sessions INTEGER NOT NULL CHECK (remaining_sessions >= 0),
  amount_paid NUMERIC(10, 2),
  purchased_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_credit_packages_clinic ON credit_packages(clinic_id);
CREATE INDEX idx_credit_packages_patient ON credit_packages(patient_id);
CREATE INDEX idx_credit_packages_remaining ON credit_packages(remaining_sessions);

CREATE TABLE package_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id UUID NOT NULL REFERENCES credit_packages(id) ON DELETE CASCADE,
  clinic_id UUID NOT NULL,
  appointment_id UUID REFERENCES appointments(id),
  action VARCHAR(20) NOT NULL CHECK (action IN ('purchase', 'deduct', 'refund', 'adjust')),
  previous_balance INTEGER NOT NULL,
  new_balance INTEGER NOT NULL,
  performed_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_package_transactions_package ON package_transactions(package_id);
CREATE INDEX idx_package_transactions_clinic ON package_transactions(clinic_id);

ALTER TABLE credit_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE package_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "packages_clinic_access" ON credit_packages
  FOR ALL USING (
    clinic_id IN (SELECT clinic_id FROM staff WHERE staff.id = auth.uid())
  );

CREATE POLICY "transactions_clinic_access" ON package_transactions
  FOR ALL USING (
    clinic_id IN (SELECT clinic_id FROM staff WHERE staff.id = auth.uid())
  );
