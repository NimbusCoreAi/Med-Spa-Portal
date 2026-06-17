-- Migration: 0021_room_exclusion.sql
-- Migration 0004 added a provider exclusion constraint but not a room exclusion.
-- Two appointments can be created for the same room at the same time.

ALTER TABLE appointments
  ADD CONSTRAINT no_room_conflicts
  EXCLUDE USING GIST (
    room_id WITH =,
    tsrange(
      scheduled_time,
      scheduled_time + (duration_minutes || ' minutes')::INTERVAL
    ) WITH &&
  ) WHERE (room_id IS NOT NULL AND status <> 'cancelled');
