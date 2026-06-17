-- 0015_feedback.sql
-- Creates feedback table for in-app feedback collection
-- Phase 5 Code Gap 1D

CREATE TABLE IF NOT EXISTS feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  submitted_by uuid NOT NULL REFERENCES staff(id),
  category text NOT NULL CHECK (category IN ('bug', 'feature', 'improvement', 'question', 'complaint')),
  message text NOT NULL,
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'triaged', 'in_progress', 'resolved', 'closed')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_feedback_clinic_id ON feedback(clinic_id);
CREATE INDEX IF NOT EXISTS idx_feedback_status ON feedback(status);

ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can submit feedback for their clinic"
  ON feedback FOR INSERT
  WITH CHECK (
    clinic_id IN (SELECT clinic_id FROM staff WHERE id = auth.uid())
  );

CREATE POLICY "Clinic staff can read their feedback"
  ON feedback FOR SELECT
  USING (
    clinic_id IN (SELECT clinic_id FROM staff WHERE id = auth.uid())
  );
