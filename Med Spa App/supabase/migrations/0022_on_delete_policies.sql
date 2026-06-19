-- Migration: 0022_on_delete_policies.sql
-- Adds explicit ON DELETE behaviors for foreign keys that were missing or defaulting
-- to RESTRICT, causing unexpected errors when deleting providers, rooms, or appointments.

-- appointments: SET NULL for optional resources, RESTRICT for patient (audit trail)
ALTER TABLE appointments
  DROP CONSTRAINT IF EXISTS appointments_provider_id_fkey,
  DROP CONSTRAINT IF EXISTS appointments_room_id_fkey;

ALTER TABLE appointments
  ADD CONSTRAINT appointments_provider_id_fkey
    FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE SET NULL,
  ADD CONSTRAINT appointments_room_id_fkey
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE SET NULL;

-- intake_submissions: missing FK on appointment_id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'intake_submissions'
      AND constraint_name = 'intake_submissions_appointment_id_fkey'
  ) THEN
    ALTER TABLE intake_submissions
      ADD CONSTRAINT intake_submissions_appointment_id_fkey
        FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE SET NULL;
  END IF;
END $$;

-- package_transactions: SET NULL on appointment delete
ALTER TABLE package_transactions
  DROP CONSTRAINT IF EXISTS package_transactions_appointment_id_fkey;

ALTER TABLE package_transactions
  ADD CONSTRAINT package_transactions_appointment_id_fkey
    FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE SET NULL;

-- marketplace_subscriptions: cascade on clinic delete
ALTER TABLE marketplace_subscriptions
  DROP CONSTRAINT IF EXISTS marketplace_subscriptions_clinic_id_fkey;

ALTER TABLE marketplace_subscriptions
  ADD CONSTRAINT marketplace_subscriptions_clinic_id_fkey
    FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE CASCADE;

-- api_usage: RESTRICT (retain metering rows for billing audit)
ALTER TABLE api_usage
  DROP CONSTRAINT IF EXISTS api_usage_clinic_id_fkey;

ALTER TABLE api_usage
  ADD CONSTRAINT api_usage_clinic_id_fkey
    FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE RESTRICT;
