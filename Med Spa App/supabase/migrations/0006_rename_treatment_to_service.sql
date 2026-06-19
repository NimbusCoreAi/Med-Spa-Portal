-- Migration: 0006_rename_treatment_to_service.sql
-- Rename treatment_type to service_type for vertical-agnostic naming
-- Idempotent: only renames if the old column exists (migration 0004 may already use service_type)

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'appointments' AND column_name = 'treatment_type'
  ) THEN
    ALTER TABLE appointments RENAME COLUMN treatment_type TO service_type;
  END IF;
END $$;
