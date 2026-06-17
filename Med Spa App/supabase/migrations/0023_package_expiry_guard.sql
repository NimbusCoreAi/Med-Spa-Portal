-- Migration: 0023_package_expiry_guard.sql
-- The deduct_package_session RPC previously decremented sessions even on expired
-- packages. This recreates the function with an expiry check so expired packages
-- are blocked at the DB level, not just in application code.

CREATE OR REPLACE FUNCTION deduct_package_session(
  p_package_id     uuid,
  p_patient_id     uuid,
  p_clinic_id      uuid,
  p_appointment_id uuid DEFAULT NULL,
  p_performed_by   uuid DEFAULT NULL
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
  SELECT remaining_sessions INTO v_previous
  FROM credit_packages
  WHERE id          = p_package_id
    AND patient_id  = p_patient_id
    AND clinic_id   = p_clinic_id
    AND (expires_at IS NULL OR expires_at > now())
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'PACKAGE_NOT_FOUND_OR_EXPIRED' USING ERRCODE = 'P0001';
  END IF;

  IF v_previous <= 0 THEN
    RAISE EXCEPTION 'INSUFFICIENT_SESSIONS' USING ERRCODE = 'P0002';
  END IF;

  v_new := v_previous - 1;

  UPDATE credit_packages
  SET remaining_sessions = v_new,
      updated_at         = now()
  WHERE id = p_package_id;

  INSERT INTO package_transactions (
    package_id, clinic_id, appointment_id, action,
    previous_balance, new_balance, performed_by
  ) VALUES (
    p_package_id, p_clinic_id, p_appointment_id, 'deduct',
    v_previous, v_new, p_performed_by
  )
  RETURNING id INTO v_txn_id;

  RETURN QUERY SELECT v_new, v_txn_id, v_previous, v_new;
END;
$$;
