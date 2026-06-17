-- Migration: 0019_fix_rls_identity.sql
-- Migrations 0014 and 0015 used staff.id = auth.uid() instead of the canonical
-- (owner_id = auth.uid() OR staff.email = auth.email()) pattern.
-- Clinic owners who have no staff row (or whose staff.id != auth.uid()) were
-- locked out of their own billing and feedback data.

-- Fix subscriptions RLS (introduced incorrectly in 0014)
DROP POLICY IF EXISTS "Clinic owners can read their subscriptions" ON subscriptions;

CREATE POLICY "Clinic staff can read their subscriptions"
  ON subscriptions FOR SELECT
  USING (
    clinic_id IN (
      SELECT id FROM clinics WHERE owner_id = auth.uid()
      UNION
      SELECT clinic_id FROM staff WHERE email = auth.email()
    )
  );

-- Fix feedback INSERT RLS (introduced incorrectly in 0015)
DROP POLICY IF EXISTS "Staff can submit feedback for their clinic" ON feedback;

CREATE POLICY "Clinic staff can submit feedback"
  ON feedback FOR INSERT
  WITH CHECK (
    clinic_id IN (
      SELECT id FROM clinics WHERE owner_id = auth.uid()
      UNION
      SELECT clinic_id FROM staff WHERE email = auth.email()
    )
  );

-- Fix feedback SELECT RLS (introduced incorrectly in 0015)
DROP POLICY IF EXISTS "Clinic staff can read their feedback" ON feedback;

CREATE POLICY "Clinic staff can read their feedback"
  ON feedback FOR SELECT
  USING (
    clinic_id IN (
      SELECT id FROM clinics WHERE owner_id = auth.uid()
      UNION
      SELECT clinic_id FROM staff WHERE email = auth.email()
    )
  );
