-- Migration: 0029_patient_email_plain_unique.sql
--
-- Fixes a runtime-breaking bug introduced by 0020_patient_unique_email.sql.
--
-- 0020 created a unique index on the EXPRESSION (clinic_id, lower(email)), but
-- findOrCreatePatient upserts with `onConflict: 'clinic_id,email'`. PostgreSQL
-- cannot infer an expression index from a bare-column conflict target, so every
-- email-based patient upsert errors at runtime:
--
--   SQLSTATE 42P10: there is no unique or exclusion constraint matching the
--   ON CONFLICT specification
--
-- This replaces the expression index with a plain unique index on real columns
-- that the upsert can infer, and normalizes stored emails to lowercase so the
-- case-insensitive uniqueness semantics of 0020 are preserved. The application
-- (findOrCreatePatient) now lowercases emails before insert/upsert as well.

-- Re-dedup on lower(email) in case duplicates appeared since 0020 ran.
-- Deterministic (created_at, id) tiebreaker so equal-created_at rows don't
-- both survive and break the unique-index creation below.
DELETE FROM patients p1
USING patients p2
WHERE p1.email IS NOT NULL
  AND p2.email IS NOT NULL
  AND p1.clinic_id = p2.clinic_id
  AND lower(p1.email) = lower(p2.email)
  AND (
    p1.created_at > p2.created_at
    OR (p1.created_at = p2.created_at AND p1.id > p2.id)
  );

-- Normalize all stored emails to lowercase so a plain (case-sensitive) unique
-- index preserves the case-insensitive uniqueness semantics of 0020.
UPDATE patients
SET email = lower(email)
WHERE email IS NOT NULL AND email <> lower(email);

-- Replace the expression index with a plain unique index on real columns.
-- The app's `onConflict: 'clinic_id,email'` can infer this index.
DROP INDEX IF EXISTS idx_patients_clinic_email_unique;
CREATE UNIQUE INDEX IF NOT EXISTS idx_patients_clinic_email_unique
  ON patients (clinic_id, email)
  WHERE email IS NOT NULL;
