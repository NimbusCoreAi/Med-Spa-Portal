-- Migration: 0016_api_keys.sql
-- Replace single shared CONNECT_API_KEY with per-clinic hashed keys.
-- Raw keys are never stored; only SHA-256 hex hashes are persisted.

CREATE TABLE IF NOT EXISTS clinic_api_keys (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id   uuid NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  key_hash    text NOT NULL UNIQUE,
  label       text NOT NULL DEFAULT 'default',
  created_at  timestamptz NOT NULL DEFAULT now(),
  revoked_at  timestamptz
);

CREATE INDEX idx_clinic_api_keys_hash ON clinic_api_keys(key_hash) WHERE revoked_at IS NULL;

ALTER TABLE clinic_api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clinic owners manage their API keys"
  ON clinic_api_keys FOR ALL
  USING (
    clinic_id IN (
      SELECT id FROM clinics WHERE owner_id = auth.uid()
    )
  );
