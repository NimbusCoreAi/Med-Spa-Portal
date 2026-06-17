-- Migration: 0017_payments_table.sql
-- Creates the standalone payments table referenced by intelligence rules engine and seed.
-- Note: appointments.amount (from 0005) tracks per-appointment charge.
-- This table tracks individual Stripe payment transaction records.

CREATE TABLE IF NOT EXISTS payments (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id           uuid NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  patient_id          uuid NOT NULL REFERENCES patients(id) ON DELETE RESTRICT,
  appointment_id      uuid REFERENCES appointments(id) ON DELETE SET NULL,
  stripe_payment_id   text UNIQUE,
  amount_cents        integer NOT NULL CHECK (amount_cents >= 0),
  currency            text NOT NULL DEFAULT 'usd',
  status              text NOT NULL CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  created_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_payments_clinic_id ON payments(clinic_id);
CREATE INDEX idx_payments_patient_id ON payments(patient_id);
CREATE INDEX idx_payments_clinic_created ON payments(clinic_id, created_at);
CREATE INDEX idx_payments_status ON payments(status);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clinic staff can view payments"
  ON payments FOR SELECT
  USING (
    clinic_id IN (
      SELECT id FROM clinics WHERE owner_id = auth.uid()
      UNION
      SELECT clinic_id FROM staff WHERE email = auth.email()
    )
  );

CREATE POLICY "Service role manages payments"
  ON payments FOR ALL
  USING (auth.role() = 'service_role');
