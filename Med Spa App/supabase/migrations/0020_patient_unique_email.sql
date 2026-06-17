-- Migration: 0020_patient_unique_email.sql
-- Eliminates the SELECT-then-INSERT race in findOrCreatePatient.
-- Two concurrent bookings for the same new patient both see null and both insert,
-- creating duplicate patient rows. A partial unique index + upsert fixes this atomically.

-- Deduplicate any existing rows first (keep the earliest created_at)
DELETE FROM patients p1
USING patients p2
WHERE p1.clinic_id = p2.clinic_id
  AND lower(p1.email) = lower(p2.email)
  AND p1.created_at > p2.created_at
  AND p1.email IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_patients_clinic_email_unique
  ON patients (clinic_id, lower(email))
  WHERE email IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_patients_clinic_phone
  ON patients (clinic_id, phone)
  WHERE phone IS NOT NULL;
