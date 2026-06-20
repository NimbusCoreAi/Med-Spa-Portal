-- Migration: 0030_seed_alpha_demo_data.sql
-- Populates Synthetic Clinic Alpha (…0a1) with demo data so the portal is
-- fully testable on launch: revenue KPIs/charts, providers, rooms, and intake forms.
--
-- All rows are marked is_synthetic = true so they can be wiped cleanly:
--   DELETE FROM <table> WHERE is_synthetic = true;
--
-- Clinic:   00000000-0000-0000-0000-0000000000a1  (Synthetic Clinic Alpha)
-- Patients: …0d1 (NoShow), …0d2 (Churn), …0d3 (Healthy)
-- Appts:    …0a21,0a22,0a23,0a24 (completed, Churn), …0a31 (completed, Healthy)
-- Staff:    …0f1 (Alpha Owner)
--
-- NOTE: created_at values are spread across the last ~60 days so the dashboard
-- revenue chart (30-day window) and prior-period trend % both render real data.

-- ─── Payments (9 rows) ───────────────────────────────────────────────────────
-- Current 30-day period total: $2,050.00  |  Prior 30-day period: $825.00  →  +148%
INSERT INTO payments (clinic_id, patient_id, appointment_id, amount_cents, currency, status, created_at, is_synthetic)
VALUES
  ('00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000d3', '00000000-0000-0000-0000-000000000a31', 35000, 'usd', 'completed', '2026-05-22T10:00:00Z', true),
  ('00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000d2', NULL, 20000, 'usd', 'completed', '2026-05-28T11:30:00Z', true),
  ('00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000d3', NULL, 65000, 'usd', 'completed', '2026-06-02T14:00:00Z', true),
  ('00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000d2', NULL, 15000, 'usd', 'completed', '2026-06-10T09:15:00Z', true),
  ('00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000d3', NULL, 30000, 'usd', 'completed', '2026-06-15T13:45:00Z', true),
  ('00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000d2', NULL, 40000, 'usd', 'completed', '2026-06-18T16:00:00Z', true),
  ('00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000d2', '00000000-0000-0000-0000-000000000a24', 20000, 'usd', 'completed', '2026-04-25T10:00:00Z', true),
  ('00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000d3', NULL, 45000, 'usd', 'completed', '2026-05-05T12:00:00Z', true),
  ('00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000d2', NULL, 17500, 'usd', 'completed', '2026-05-12T15:30:00Z', true)
ON CONFLICT DO NOTHING;

-- ─── Providers (3 rows) ──────────────────────────────────────────────────────
INSERT INTO providers (clinic_id, name, specialties, availability, is_synthetic)
VALUES
  ('00000000-0000-0000-0000-0000000000a1', 'Dr. Sarah Chen',
   ARRAY['Botox', 'Dermal Fillers', 'Chemical Peels'],
   '{"monday":["09:00-17:00"],"tuesday":["09:00-17:00"],"wednesday":["09:00-17:00"]}'::jsonb, true),
  ('00000000-0000-0000-0000-0000000000a1', 'Dr. Michael Torres',
   ARRAY['Laser Therapy', 'Skin Rejuvenation'],
   '{"monday":["10:00-18:00"],"thursday":["10:00-18:00"],"friday":["10:00-18:00"]}'::jsonb, true),
  ('00000000-0000-0000-0000-0000000000a1', 'NP Emma Walsh',
   ARRAY['Facials', 'Microneedling', 'Consultations'],
   '{"tuesday":["08:00-16:00"],"wednesday":["08:00-16:00"],"friday":["08:00-12:00"]}'::jsonb, true)
ON CONFLICT DO NOTHING;

-- ─── Rooms (4 rows) ──────────────────────────────────────────────────────────
INSERT INTO rooms (clinic_id, name, capacity, is_synthetic)
VALUES
  ('00000000-0000-0000-0000-0000000000a1', 'Treatment Room A', 1, true),
  ('00000000-0000-0000-0000-0000000000a1', 'Treatment Room B', 1, true),
  ('00000000-0000-0000-0000-0000000000a1', 'Laser Suite', 1, true),
  ('00000000-0000-0000-0000-0000000000a1', 'Consultation Room', 2, true)
ON CONFLICT DO NOTHING;

-- ─── Intake forms (2 rows) ───────────────────────────────────────────────────
INSERT INTO intake_forms (clinic_id, name, fields)
VALUES
  ('00000000-0000-0000-0000-0000000000a1', 'New Patient Intake',
   '[{"id":"full_name","label":"Full Name","type":"text","required":true},{"id":"dob","label":"Date of Birth","type":"date","required":true},{"id":"phone","label":"Phone Number","type":"tel","required":true},{"id":"medical_history","label":"Medical History","type":"textarea","required":false},{"id":"allergies","label":"Known Allergies","type":"textarea","required":false}]'::jsonb),
  ('00000000-0000-0000-0000-0000000000a1', 'Botox Treatment Consent',
   '[{"id":"acknowledge_risks","label":"I acknowledge the risks of Botox treatment","type":"checkbox","required":true},{"id":"not_pregnant","label":"I confirm I am not pregnant or nursing","type":"checkbox","required":true},{"id":"signature","label":"Signature","type":"signature","required":true}]'::jsonb)
ON CONFLICT DO NOTHING;
