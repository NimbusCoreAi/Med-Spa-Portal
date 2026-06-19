-- Migration: 0028_credit_package_updated_at.sql
--
-- Fixes a runtime-breaking bug introduced by 0023_package_expiry_guard.sql.
-- The `deduct_package_session` function writes `updated_at = now()` on
-- credit_packages (0023:46), but that table has no `updated_at` column
-- (see 0009_credit_packages.sql). CREATE OR REPLACE FUNCTION succeeds because
-- plpgsql does not bind columns at create time, so the migration applied
-- cleanly — but every call to deduct_package_session throws at runtime:
--
--   ERROR: column "updated_at" of relation "credit_packages" does not exist
--
-- Adding the column makes the existing RPC (re)created by 0023 work in every
-- environment, whether or not 0023 has run yet. Idempotent.

ALTER TABLE credit_packages
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
