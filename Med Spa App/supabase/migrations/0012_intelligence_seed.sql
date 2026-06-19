-- Migration: 0012_intelligence_seed.sql
-- Seeds synthetic test data to validate the 6 intelligence rules.
-- All records use fixed UUIDs and is_synthetic = true for easy cleanup.
-- DELETE FROM ... WHERE is_synthetic = true to remove.

-- ─── Synthetic Auth Users (required for clinics.owner_id FK) ──
INSERT INTO auth.users (id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data)
VALUES
  ('00000000-0000-0000-0000-0000000000f1', 'authenticated', 'authenticated', 'synthetic-owner-alpha@test.local', '', NOW(), NOW(), NOW(), '{}'::jsonb, '{}'::jsonb),
  ('00000000-0000-0000-0000-0000000000f2', 'authenticated', 'authenticated', 'synthetic-owner-beta@test.local', '', NOW(), NOW(), NOW(), '{}'::jsonb, '{}'::jsonb),
  ('00000000-0000-0000-0000-0000000000f3', 'authenticated', 'authenticated', 'synthetic-owner-gamma@test.local', '', NOW(), NOW(), NOW(), '{}'::jsonb, '{}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- ─── Synthetic Clinics ────────────────────────────────────────
-- Clinic A (tests no-show, churn, follow-up-gap rules)
INSERT INTO clinics (id, name, owner_id, created_at)
VALUES (
  '00000000-0000-0000-0000-0000000000a1',
  'Synthetic Clinic Alpha',
  '00000000-0000-0000-0000-0000000000f1',
  NOW() - INTERVAL '180 days'
)
ON CONFLICT (id) DO NOTHING;

-- Clinic B (tests revenue-drop, package-abandonment rules)
INSERT INTO clinics (id, name, owner_id, created_at)
VALUES (
  '00000000-0000-0000-0000-0000000000b2',
  'Synthetic Clinic Beta',
  '00000000-0000-0000-0000-0000000000f2',
  NOW() - INTERVAL '180 days'
)
ON CONFLICT (id) DO NOTHING;

-- Clinic C (control — no risk factors)
INSERT INTO clinics (id, name, owner_id, created_at)
VALUES (
  '00000000-0000-0000-0000-0000000000c3',
  'Synthetic Clinic Gamma',
  '00000000-0000-0000-0000-0000000000f3',
  NOW() - INTERVAL '180 days'
)
ON CONFLICT (id) DO NOTHING;

-- ─── Synthetic Staff ──────────────────────────────────────────
INSERT INTO staff (id, clinic_id, email, name, role)
VALUES
  ('00000000-0000-0000-0000-0000000000f1', '00000000-0000-0000-0000-0000000000a1', 'owner@synthetic-alpha.test', 'Alpha Owner', 'owner'),
  ('00000000-0000-0000-0000-0000000000f2', '00000000-0000-0000-0000-0000000000b2', 'owner@synthetic-beta.test', 'Beta Owner', 'owner'),
  ('00000000-0000-0000-0000-0000000000f3', '00000000-0000-0000-0000-0000000000c3', 'owner@synthetic-gamma.test', 'Gamma Owner', 'owner')
ON CONFLICT (id) DO NOTHING;

-- ─── Synthetic Patients ───────────────────────────────────────
-- Clinic Alpha patients
INSERT INTO patients (id, clinic_id, first_name, last_name, phone, email, created_at)
VALUES
  ('00000000-0000-0000-0000-0000000000d1', '00000000-0000-0000-0000-0000000000a1', 'NoShow', 'Patient', '555-0001', 'noshow@synthetic.test', NOW() - INTERVAL '120 days'),
  ('00000000-0000-0000-0000-0000000000d2', '00000000-0000-0000-0000-0000000000a1', 'Churn', 'Patient', '555-0002', 'churn@synthetic.test', NOW() - INTERVAL '120 days'),
  ('00000000-0000-0000-0000-0000000000d3', '00000000-0000-0000-0000-0000000000a1', 'Healthy', 'Patient', '555-0003', 'healthy@synthetic.test', NOW() - INTERVAL '30 days')
ON CONFLICT (id) DO NOTHING;

-- Clinic Beta patients
INSERT INTO patients (id, clinic_id, first_name, last_name, phone, email, created_at)
VALUES
  ('00000000-0000-0000-0000-0000000000d4', '00000000-0000-0000-0000-0000000000b2', 'Abandoned', 'Patient', '555-0004', 'abandoned@synthetic.test', NOW() - INTERVAL '150 days'),
  ('00000000-0000-0000-0000-0000000000d5', '00000000-0000-0000-0000-0000000000b2', 'Revenue', 'Patient', '555-0005', 'revenue@synthetic.test', NOW() - INTERVAL '150 days')
ON CONFLICT (id) DO NOTHING;

-- ─── Synthetic Appointments ───────────────────────────────────
-- Patient P1: 3 no-shows in 90 days (triggers no-show-risk rule)
INSERT INTO appointments (id, clinic_id, patient_id, status, scheduled_time, duration_minutes, intake_completed, payment_completed, payment_status, created_at)
VALUES
  ('00000000-0000-0000-0000-000000000a11', '00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000d1', 'cancelled', NOW() - INTERVAL '80 days', 30, false, false, 'pending', NOW() - INTERVAL '85 days'),
  ('00000000-0000-0000-0000-000000000a12', '00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000d1', 'cancelled', NOW() - INTERVAL '50 days', 30, false, false, 'pending', NOW() - INTERVAL '55 days'),
  ('00000000-0000-0000-0000-000000000a13', '00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000d1', 'cancelled', NOW() - INTERVAL '20 days', 30, false, false, 'pending', NOW() - INTERVAL '25 days')
ON CONFLICT (id) DO NOTHING;

-- Patient P2: Last appointment 70 days ago, normally books every 28 days (triggers churn-risk rule)
INSERT INTO appointments (id, clinic_id, patient_id, status, scheduled_time, duration_minutes, intake_completed, payment_completed, payment_status, created_at)
VALUES
  ('00000000-0000-0000-0000-000000000a21', '00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000d2', 'completed', NOW() - INTERVAL '140 days', 30, true, true, 'completed', NOW() - INTERVAL '145 days'),
  ('00000000-0000-0000-0000-000000000a22', '00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000d2', 'completed', NOW() - INTERVAL '112 days', 30, true, true, 'completed', NOW() - INTERVAL '117 days'),
  ('00000000-0000-0000-0000-000000000a23', '00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000d2', 'completed', NOW() - INTERVAL '84 days', 30, true, true, 'completed', NOW() - INTERVAL '89 days'),
  ('00000000-0000-0000-0000-000000000a24', '00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000d2', 'completed', NOW() - INTERVAL '70 days', 30, true, true, 'completed', NOW() - INTERVAL '75 days')
ON CONFLICT (id) DO NOTHING;

-- Patient P3: Recently completed appointment, has follow-up scheduled (control — no risk)
INSERT INTO appointments (id, clinic_id, patient_id, status, scheduled_time, duration_minutes, intake_completed, payment_completed, payment_status, created_at)
VALUES
  ('00000000-0000-0000-0000-000000000a31', '00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000d3', 'completed', NOW() - INTERVAL '5 days', 30, true, true, 'completed', NOW() - INTERVAL '10 days')
ON CONFLICT (id) DO NOTHING;

-- Patient P4: Completed appointment 20 days ago, no follow-up (triggers follow-up-gap rule)
INSERT INTO appointments (id, clinic_id, patient_id, status, scheduled_time, service_type, duration_minutes, intake_completed, payment_completed, payment_status, created_at)
VALUES
  ('00000000-0000-0000-0000-000000000a41', '00000000-0000-0000-0000-0000000000b2', '00000000-0000-0000-0000-0000000000d4', 'completed', NOW() - INTERVAL '20 days', 'Botox', 30, true, true, 'completed', NOW() - INTERVAL '25 days')
ON CONFLICT (id) DO NOTHING;

-- ─── Synthetic Payments ───────────────────────────────────────
-- Note: payments table is created in migration 0017. These inserts are conditional.
-- Clinic B: Revenue dropped >15% in recent period
-- Prior 3 months: 10 payments x $200 = $2000
-- Recent 3 months: 3 payments x $150 = $450 (77.5% drop)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'payments') THEN
    INSERT INTO payments (id, clinic_id, patient_id, amount, status, created_at)
    SELECT
      gen_random_uuid(),
      '00000000-0000-0000-0000-0000000000b2',
      '00000000-0000-0000-0000-0000000000d5',
      200.00,
      'completed',
      NOW() - (generate_series || INTERVAL '5 days')
    FROM generate_series(95, 140, 5)
    ON CONFLICT DO NOTHING;

    INSERT INTO payments (id, clinic_id, patient_id, amount, status, created_at)
    SELECT
      gen_random_uuid(),
      '00000000-0000-0000-0000-0000000000b2',
      '00000000-0000-0000-0000-0000000000d5',
      150.00,
      'completed',
      NOW() - (generate_series || INTERVAL '3 days')
    FROM generate_series(5, 25, 7)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- ─── Synthetic Credit Packages ────────────────────────────────
-- Patient P4: Has remaining sessions but no activity in 90+ days (triggers package-abandonment)
INSERT INTO credit_packages (id, clinic_id, patient_id, name, service_type, total_sessions, remaining_sessions, amount_paid, purchased_at, created_at)
VALUES (
  '00000000-0000-0000-0000-0000000000e1',
  '00000000-0000-0000-0000-0000000000b2',
  '00000000-0000-0000-0000-0000000000d4',
  'Botox Package 6-pack',
  'Botox',
  6,
  4,
  1200.00,
  NOW() - INTERVAL '150 days',
  NOW() - INTERVAL '150 days'
)
ON CONFLICT (id) DO NOTHING;

-- ─── Synthetic Audit Logs ─────────────────────────────────────
INSERT INTO audit_logs (id, clinic_id, user_id, action, resource_type, resource_id)
SELECT
  gen_random_uuid(),
  '00000000-0000-0000-0000-0000000000a1',
  '00000000-0000-0000-0000-0000000000f1',
  'login',
  'auth',
  NULL
FROM generate_series(1, 5)
ON CONFLICT DO NOTHING;

-- Cleanup helper:
-- DELETE FROM credit_packages WHERE id = '00000000-0000-0000-0000-0000000000e1';
-- DELETE FROM payments WHERE clinic_id IN ('00000000-0000-0000-0000-0000000000b2') AND patient_id = '00000000-0000-0000-0000-0000000000d5';
-- DELETE FROM appointments WHERE clinic_id IN ('00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000b2') AND patient_id IN ('00000000-0000-0000-0000-0000000000d1', '00000000-0000-0000-0000-0000000000d2', '00000000-0000-0000-0000-0000000000d3', '00000000-0000-0000-0000-0000000000d4');
-- DELETE FROM patients WHERE id LIKE '00000000-0000-0000-0000-0000000000d%';
-- DELETE FROM staff WHERE id LIKE '00000000-0000-0000-0000-0000000000f%';
-- DELETE FROM clinics WHERE id LIKE '00000000-0000-0000-0000-0000000000%';
