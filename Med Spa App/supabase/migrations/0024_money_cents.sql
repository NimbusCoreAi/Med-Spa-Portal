-- Migration: 0024_money_cents.sql
-- Convert NUMERIC(10,2) dollar columns to INTEGER cents.
-- Storing money as integer cents avoids floating-point rounding errors
-- and is the standard pattern for financial data.
-- Idempotency: guarded by column type check — only runs if columns are still NUMERIC.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'appointments' AND column_name = 'amount'
    AND data_type = 'numeric'
  ) THEN
    UPDATE appointments
      SET amount = ROUND(amount * 100)
      WHERE amount IS NOT NULL;

    ALTER TABLE appointments
      ALTER COLUMN amount TYPE INTEGER USING ROUND(amount)::INTEGER;

    COMMENT ON COLUMN appointments.amount IS 'Charge amount stored as integer cents (e.g. 15000 = $150.00)';
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'credit_packages' AND column_name = 'amount_paid'
    AND data_type = 'numeric'
  ) THEN
    UPDATE credit_packages
      SET amount_paid = ROUND(amount_paid * 100)
      WHERE amount_paid IS NOT NULL;

    ALTER TABLE credit_packages
      ALTER COLUMN amount_paid TYPE INTEGER USING ROUND(amount_paid)::INTEGER;

    COMMENT ON COLUMN credit_packages.amount_paid IS 'Amount paid stored as integer cents (e.g. 15000 = $150.00)';
  END IF;
END $$;
