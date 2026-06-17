-- Migration: 0004_scheduling.sql
-- Providers, treatment rooms, and appointments with double-booking prevention

CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE TABLE providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID REFERENCES clinics(id),
  name VARCHAR(255) NOT NULL,
  specialties TEXT[],
  availability JSONB, -- { "monday": ["09:00-17:00"] }
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID REFERENCES clinics(id),
  name VARCHAR(255) NOT NULL,
  capacity INT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID REFERENCES clinics(id),
  patient_id UUID REFERENCES patients(id),
  provider_id UUID REFERENCES providers(id),
  room_id UUID REFERENCES rooms(id),
  service_type VARCHAR(255),
  scheduled_time TIMESTAMP NOT NULL,
  duration_minutes INT NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'scheduled', -- 'scheduled', 'completed', 'cancelled'
  intake_completed BOOLEAN DEFAULT FALSE,
  payment_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),

  CONSTRAINT no_provider_conflicts EXCLUDE USING GIST (
    provider_id WITH =,
    tsrange(scheduled_time, scheduled_time + (duration_minutes || ' minutes')::INTERVAL) WITH &&
  ) WHERE (status <> 'cancelled')
);

-- Indexes for common lookups
CREATE INDEX idx_providers_clinic_id ON providers(clinic_id);
CREATE INDEX idx_rooms_clinic_id ON rooms(clinic_id);
CREATE INDEX idx_appointments_clinic_id ON appointments(clinic_id);
CREATE INDEX idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX idx_appointments_provider_id ON appointments(provider_id);
CREATE INDEX idx_appointments_scheduled_time ON appointments(scheduled_time);

-- RLS
ALTER TABLE providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Providers: clinic staff/owners manage their own clinic's providers
CREATE POLICY providers_select_own_clinic ON providers
  FOR SELECT USING (
    clinic_id IN (
      SELECT id FROM clinics WHERE owner_id = auth.uid()
      UNION
      SELECT clinic_id FROM staff WHERE email = auth.email()
    )
  );

CREATE POLICY providers_insert_own_clinic ON providers
  FOR INSERT WITH CHECK (
    clinic_id IN (
      SELECT id FROM clinics WHERE owner_id = auth.uid()
      UNION
      SELECT clinic_id FROM staff WHERE email = auth.email()
    )
  );

CREATE POLICY providers_update_own_clinic ON providers
  FOR UPDATE USING (
    clinic_id IN (
      SELECT id FROM clinics WHERE owner_id = auth.uid()
      UNION
      SELECT clinic_id FROM staff WHERE email = auth.email()
    )
  );

-- Providers: anyone can view providers for self-booking (name/specialties only via API)
CREATE POLICY providers_select_public ON providers
  FOR SELECT USING (true);

-- Rooms: clinic staff/owners manage their own clinic's rooms
CREATE POLICY rooms_select_own_clinic ON rooms
  FOR SELECT USING (
    clinic_id IN (
      SELECT id FROM clinics WHERE owner_id = auth.uid()
      UNION
      SELECT clinic_id FROM staff WHERE email = auth.email()
    )
  );

CREATE POLICY rooms_insert_own_clinic ON rooms
  FOR INSERT WITH CHECK (
    clinic_id IN (
      SELECT id FROM clinics WHERE owner_id = auth.uid()
      UNION
      SELECT clinic_id FROM staff WHERE email = auth.email()
    )
  );

CREATE POLICY rooms_update_own_clinic ON rooms
  FOR UPDATE USING (
    clinic_id IN (
      SELECT id FROM clinics WHERE owner_id = auth.uid()
      UNION
      SELECT clinic_id FROM staff WHERE email = auth.email()
    )
  );

-- Appointments: clinic staff/owners can view/manage all appointments for their clinic
CREATE POLICY appointments_select_own_clinic ON appointments
  FOR SELECT USING (
    clinic_id IN (
      SELECT id FROM clinics WHERE owner_id = auth.uid()
      UNION
      SELECT clinic_id FROM staff WHERE email = auth.email()
    )
  );

CREATE POLICY appointments_update_own_clinic ON appointments
  FOR UPDATE USING (
    clinic_id IN (
      SELECT id FROM clinics WHERE owner_id = auth.uid()
      UNION
      SELECT clinic_id FROM staff WHERE email = auth.email()
    )
  );

-- Appointments: patients can self-book (insert) without authentication
CREATE POLICY appointments_insert_any ON appointments
  FOR INSERT WITH CHECK (true);
