-- Migration: 0027_performance_indexes.sql
-- Composite and partial indexes for hot query paths identified in the audit.

-- Calendar lookups filter by clinic + date range
CREATE INDEX IF NOT EXISTS idx_appointments_clinic_scheduled_time
  ON appointments (clinic_id, scheduled_time);

-- Outstanding-payment dashboard queries filter on non-completed status
CREATE INDEX IF NOT EXISTS idx_appointments_payment_status_open
  ON appointments (payment_status)
  WHERE payment_status <> 'completed';

-- payments(clinic_id, created_at) already created in 0017 as idx_payments_clinic_created;
-- IF NOT EXISTS avoids a duplicate-create error.
CREATE INDEX IF NOT EXISTS idx_payments_clinic_created
  ON payments (clinic_id, created_at);

-- patients(clinic_id, lower(email)) already created in 0020 as idx_patients_clinic_email_unique;
-- IF NOT EXISTS avoids a duplicate-create error.
CREATE INDEX IF NOT EXISTS idx_patients_clinic_email_unique
  ON patients (clinic_id, lower(email))
  WHERE email IS NOT NULL;

-- Marketplace subscription lookups by clinic + status
CREATE INDEX IF NOT EXISTS idx_marketplace_subscriptions_clinic_status
  ON marketplace_subscriptions (clinic_id, status);
