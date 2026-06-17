-- Migration: 0025_seed_is_synthetic.sql
-- Add is_synthetic flag to core tables so seed/test data can be cleanly removed:
--   DELETE FROM <table> WHERE is_synthetic = true;
-- Defaults to false so all existing and new production rows are unaffected.

ALTER TABLE clinics ADD COLUMN IF NOT EXISTS is_synthetic BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS is_synthetic BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE providers ADD COLUMN IF NOT EXISTS is_synthetic BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS is_synthetic BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS is_synthetic BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS is_synthetic BOOLEAN NOT NULL DEFAULT false;
