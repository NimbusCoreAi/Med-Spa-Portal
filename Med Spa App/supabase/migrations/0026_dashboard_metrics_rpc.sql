-- Migration: 0026_dashboard_metrics_rpc.sql
-- Single-query dashboard metrics to avoid N+1 round trips from the client.
-- Returns aggregate counts/revenue for a clinic in one RPC call.
-- Revenue and unique_patients are scoped to the last 30 days; all other
-- metrics are all-time for the given clinic.

CREATE OR REPLACE FUNCTION get_dashboard_metrics(p_clinic_id uuid)
RETURNS TABLE (
  total_appointments     BIGINT,
  completed_appointments BIGINT,
  cancelled_appointments BIGINT,
  total_revenue          BIGINT,
  unique_patients        BIGINT,
  upcoming_appointments  BIGINT
)
LANGUAGE sql
STABLE
AS $$
  WITH appt_stats AS (
    SELECT
      COUNT(*)                                                       AS total_appointments,
      COUNT(*) FILTER (WHERE status = 'completed')                   AS completed_appointments,
      COUNT(*) FILTER (WHERE status = 'cancelled')                   AS cancelled_appointments,
      COUNT(DISTINCT patient_id)
        FILTER (WHERE scheduled_time > now() - INTERVAL '30 days')   AS unique_patients,
      COUNT(*) FILTER (WHERE scheduled_time > now())                 AS upcoming_appointments
    FROM appointments
    WHERE clinic_id = p_clinic_id
  ),
  rev_stats AS (
    SELECT COALESCE(SUM(amount_cents), 0) AS total_revenue
    FROM payments
    WHERE clinic_id  = p_clinic_id
      AND status     = 'completed'
      AND created_at > now() - INTERVAL '30 days'
  )
  SELECT
    a.total_appointments,
    a.completed_appointments,
    a.cancelled_appointments,
    r.total_revenue,
    a.unique_patients,
    a.upcoming_appointments
  FROM appt_stats a, rev_stats r;
$$;
