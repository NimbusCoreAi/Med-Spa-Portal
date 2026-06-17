-- Migration: 0001_init_clinics.sql
-- Core tables for Baseplate Med Spa Portal (clinics, staff, patients, audit_logs)

CREATE TABLE clinics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  location VARCHAR(255),
  phone VARCHAR(20),
  num_providers INT,
  created_at TIMESTAMP DEFAULT NOW(),
  owner_id UUID REFERENCES auth.users(id)
);

CREATE TABLE staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID REFERENCES clinics(id),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  role VARCHAR(50), -- 'owner', 'staff'
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID REFERENCES clinics(id),
  email VARCHAR(255),
  phone VARCHAR(20),
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID REFERENCES clinics(id),
  user_id UUID REFERENCES auth.users(id),
  action VARCHAR(100),
  resource_type VARCHAR(50),
  resource_id UUID,
  timestamp TIMESTAMP DEFAULT NOW(),
  ip_address VARCHAR(50),
  user_agent TEXT
);

-- Indexes for common lookups
CREATE INDEX idx_staff_clinic_id ON staff(clinic_id);
CREATE INDEX idx_patients_clinic_id ON patients(clinic_id);
CREATE INDEX idx_audit_logs_clinic_id ON audit_logs(clinic_id);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
