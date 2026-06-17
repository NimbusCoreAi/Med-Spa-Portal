-- Migration: 0008_staff_insert_policy.sql
-- Add INSERT policy on staff table so signup can create the owner's staff record.
-- Without this, RLS blocks the staff insert during signUp(), which means
-- the owner has no staff record and cannot access role-gated pages (audit logs).

CREATE POLICY staff_insert_self ON staff
  FOR INSERT WITH CHECK (
    id = auth.uid()
    AND clinic_id IN (SELECT id FROM clinics WHERE owner_id = auth.uid())
  );
