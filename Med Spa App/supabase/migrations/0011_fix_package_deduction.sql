-- Migration: 0011_fix_package_deduction.sql
-- Fixes three issues from the Phase 2 audit:
--   1. Race condition: deductPackageSession was non-atomic (read→modify→write).
--      This migration adds an RPC that decrements + logs in a single transaction.
--   2. RLS policies on credit_packages/package_transactions used staff.id = auth.uid()
--      only — clinic owners were locked out. Now uses the same owner_id UNION
--      staff pattern as every other migration.
--   3. Missing FK constraints on package_transactions.

-- ─── 1. Atomic deduction RPC ──────────────────────────────────

CREATE OR REPLACE FUNCTION deduct_package_session(
  p_package_id   UUID,
  p_patient_id   UUID,
  p_clinic_id    UUID,
  p_appointment_id UUID DEFAULT NULL,
  p_performed_by UUID DEFAULT NULL
)
RETURNS TABLE (
  remaining_sessions INTEGER,
  transaction_id     UUID,
  previous_balance   INTEGER,
  new_balance        INTEGER
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_previous INTEGER;
  v_new      INTEGER;
  v_txn_id   UUID;
BEGIN
  -- Lock the row, read current balance atomically
  SELECT remaining_sessions INTO v_previous
  FROM credit_packages
  WHERE id = p_package_id
    AND patient_id = p_patient_id
    AND clinic_id = p_clinic_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'PACKAGE_NOT_FOUND';
  END IF;

  IF v_previous <= 0 THEN
    RAISE EXCEPTION 'NO_SESSIONS_REMAINING';
  END IF;

  v_new := v_previous - 1;

  UPDATE credit_packages
  SET remaining_sessions = v_new
  WHERE id = p_package_id;

  INSERT INTO package_transactions (
    package_id, clinic_id, appointment_id, action,
    previous_balance, new_balance, performed_by
  )
  VALUES (
    p_package_id, p_clinic_id, p_appointment_id, 'deduct',
    v_previous, v_new, p_performed_by
  )
  RETURNING id INTO v_txn_id;

  RETURN QUERY SELECT v_new, v_txn_id, v_previous, v_new;
END;
$$;

-- ─── 2. Fix RLS policies ──────────────────────────────────────

DROP POLICY IF EXISTS "packages_clinic_access" ON credit_packages;
DROP POLICY IF EXISTS "transactions_clinic_access" ON package_transactions;

-- Use the same owner_id UNION staff.email pattern as migrations 0002/0004
CREATE POLICY "packages_clinic_access" ON credit_packages
  FOR ALL USING (
    clinic_id IN (
      SELECT id FROM clinics WHERE owner_id = auth.uid()
      UNION
      SELECT clinic_id FROM staff WHERE email = auth.email()
    )
  );

CREATE POLICY "transactions_clinic_access" ON package_transactions
  FOR ALL USING (
    clinic_id IN (
      SELECT id FROM clinics WHERE owner_id = auth.uid()
      UNION
      SELECT clinic_id FROM staff WHERE email = auth.email()
    )
  );

-- ─── 3. Add missing FK constraints ────────────────────────────

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'package_transactions_clinic_id_fkey'
      AND table_name = 'package_transactions'
  ) THEN
    ALTER TABLE package_transactions
      ADD CONSTRAINT package_transactions_clinic_id_fkey
      FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'package_transactions_performed_by_fkey'
      AND table_name = 'package_transactions'
  ) THEN
    ALTER TABLE package_transactions
      ADD CONSTRAINT package_transactions_performed_by_fkey
      FOREIGN KEY (performed_by) REFERENCES staff(id) ON DELETE SET NULL;
  END IF;
END $$;
