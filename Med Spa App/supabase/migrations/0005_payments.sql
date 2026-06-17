-- Migration: 0005_payments.sql
-- Add payment tracking fields to appointments

ALTER TABLE appointments
  ADD COLUMN amount NUMERIC(10, 2),
  ADD COLUMN payment_status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'completed', 'failed'
  ADD COLUMN payment_link_url TEXT,
  ADD COLUMN payment_completed_at TIMESTAMP;
