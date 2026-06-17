-- Migration: 0003_intake_forms.sql
-- Intake form builder + patient intake submissions (Phase 1D.1)

CREATE TABLE intake_forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID REFERENCES clinics(id),
  name VARCHAR(255) NOT NULL,
  fields JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE intake_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID REFERENCES clinics(id),
  patient_id UUID REFERENCES patients(id),
  form_id UUID REFERENCES intake_forms(id),
  appointment_id UUID,
  responses JSONB NOT NULL DEFAULT '{}',
  signed_consent BOOLEAN NOT NULL DEFAULT FALSE,
  signed_at TIMESTAMP,
  status VARCHAR(20) NOT NULL DEFAULT 'not_started', -- 'not_started', 'in_progress', 'completed'
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_intake_forms_clinic_id ON intake_forms(clinic_id);
CREATE INDEX idx_intake_submissions_clinic_id ON intake_submissions(clinic_id);
CREATE INDEX idx_intake_submissions_form_id ON intake_submissions(form_id);
CREATE INDEX idx_intake_submissions_appointment_id ON intake_submissions(appointment_id);

-- RLS
ALTER TABLE intake_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE intake_submissions ENABLE ROW LEVEL SECURITY;

-- Intake forms: staff/owners manage forms for their own clinic
CREATE POLICY intake_forms_select_own_clinic ON intake_forms
  FOR SELECT USING (
    clinic_id IN (
      SELECT id FROM clinics WHERE owner_id = auth.uid()
      UNION
      SELECT clinic_id FROM staff WHERE email = auth.email()
    )
  );

CREATE POLICY intake_forms_insert_own_clinic ON intake_forms
  FOR INSERT WITH CHECK (
    clinic_id IN (
      SELECT id FROM clinics WHERE owner_id = auth.uid()
      UNION
      SELECT clinic_id FROM staff WHERE email = auth.email()
    )
  );

CREATE POLICY intake_forms_update_own_clinic ON intake_forms
  FOR UPDATE USING (
    clinic_id IN (
      SELECT id FROM clinics WHERE owner_id = auth.uid()
      UNION
      SELECT clinic_id FROM staff WHERE email = auth.email()
    )
  );

-- Intake submissions: staff/owners can view submissions for their clinic
CREATE POLICY intake_submissions_select_own_clinic ON intake_submissions
  FOR SELECT USING (
    clinic_id IN (
      SELECT id FROM clinics WHERE owner_id = auth.uid()
      UNION
      SELECT clinic_id FROM staff WHERE email = auth.email()
    )
  );

-- Intake submissions: anyone can insert a submission for a clinic (patient self-service, anon key)
CREATE POLICY intake_submissions_insert_any ON intake_submissions
  FOR INSERT WITH CHECK (true);

-- Intake submissions: staff/owners can update status for their clinic
CREATE POLICY intake_submissions_update_own_clinic ON intake_submissions
  FOR UPDATE USING (
    clinic_id IN (
      SELECT id FROM clinics WHERE owner_id = auth.uid()
      UNION
      SELECT clinic_id FROM staff WHERE email = auth.email()
    )
  );
