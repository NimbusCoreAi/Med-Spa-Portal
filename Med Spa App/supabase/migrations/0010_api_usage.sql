-- Migration: 0010_api_usage.sql
-- API usage logging for metering infrastructure (Phase 5 billing enforcement).

CREATE TABLE api_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID REFERENCES clinics(id) ON DELETE SET NULL,
  endpoint VARCHAR(200) NOT NULL,
  method VARCHAR(10) NOT NULL DEFAULT 'POST',
  status_code INTEGER NOT NULL,
  response_time_ms INTEGER,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_api_usage_clinic_month ON api_usage(clinic_id, timestamp);
CREATE INDEX idx_api_usage_endpoint ON api_usage(endpoint, timestamp);

-- RLS: only service-role can access (Connect API uses service-role client)
ALTER TABLE api_usage ENABLE ROW LEVEL SECURITY;
