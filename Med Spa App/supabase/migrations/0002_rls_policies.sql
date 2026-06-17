-- Migration: 0002_rls_policies.sql
-- Enable Row Level Security and define access policies

ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Clinics: owner can see and manage their own clinic
CREATE POLICY clinic_owner_select ON clinics
  FOR SELECT USING (owner_id = auth.uid());

CREATE POLICY clinic_owner_update ON clinics
  FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY clinic_owner_insert ON clinics
  FOR INSERT WITH CHECK (owner_id = auth.uid());

-- Staff: members can see other staff in their own clinic
CREATE POLICY staff_select_own_clinic ON staff
  FOR SELECT USING (
    clinic_id IN (
      SELECT id FROM clinics WHERE owner_id = auth.uid()
      UNION
      SELECT clinic_id FROM staff WHERE email = auth.email()
    )
  );

-- Patients: staff/owners can see patients belonging to their clinic
CREATE POLICY patients_select_own_clinic ON patients
  FOR SELECT USING (
    clinic_id IN (
      SELECT id FROM clinics WHERE owner_id = auth.uid()
      UNION
      SELECT clinic_id FROM staff WHERE email = auth.email()
    )
  );

CREATE POLICY patients_insert_own_clinic ON patients
  FOR INSERT WITH CHECK (
    clinic_id IN (
      SELECT id FROM clinics WHERE owner_id = auth.uid()
      UNION
      SELECT clinic_id FROM staff WHERE email = auth.email()
    )
  );

-- Audit logs: only owners can view audit logs for their clinic
CREATE POLICY audit_logs_owner_select ON audit_logs
  FOR SELECT USING (
    clinic_id IN (SELECT id FROM clinics WHERE owner_id = auth.uid())
  );

-- Audit logs: any authenticated staff/owner of the clinic can insert
CREATE POLICY audit_logs_insert_own_clinic ON audit_logs
  FOR INSERT WITH CHECK (
    clinic_id IN (
      SELECT id FROM clinics WHERE owner_id = auth.uid()
      UNION
      SELECT clinic_id FROM staff WHERE email = auth.email()
    )
  );
