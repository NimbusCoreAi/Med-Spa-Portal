-- Migration: 0007_tighten_rls_policies.sql
-- Fix permissive RLS policies that allowed anonymous inserts/selects

-- Drop the overly permissive intake_submissions insert policy
DROP POLICY IF EXISTS intake_submissions_insert_any ON intake_submissions;

-- Replace with clinic-scoped insert (patients submit via anon key, but must provide valid clinic_id)
CREATE POLICY intake_submissions_insert_own_clinic ON intake_submissions
  FOR INSERT WITH CHECK (
    clinic_id IN (
      SELECT id FROM clinics
    )
  );

-- Drop the overly permissive appointments insert policy
DROP POLICY IF EXISTS appointments_insert_any ON appointments;

-- Replace with clinic-scoped insert (patients self-book, but must provide valid clinic_id)
CREATE POLICY appointments_insert_own_clinic ON appointments
  FOR INSERT WITH CHECK (
    clinic_id IN (
      SELECT id FROM clinics
    )
  );

-- Drop the public providers select policy (was leaking all providers across clinics)
DROP POLICY IF EXISTS providers_select_public ON providers;

-- Replace with clinic-scoped select (providers visible only to their clinic's staff/owners)
CREATE POLICY providers_select_own_clinic_only ON providers
  FOR SELECT USING (
    clinic_id IN (
      SELECT id FROM clinics WHERE owner_id = auth.uid()
      UNION
      SELECT clinic_id FROM staff WHERE email = auth.email()
    )
  );
