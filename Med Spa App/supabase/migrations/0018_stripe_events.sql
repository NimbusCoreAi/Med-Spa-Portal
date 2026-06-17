-- Migration: 0018_stripe_events.sql
-- Adds processed_stripe_events table for webhook idempotency.
-- Bare INSERT on subscription.created causes retry storms on unique constraint violation;
-- this table acts as a dedup guard before any processing occurs.

CREATE TABLE IF NOT EXISTS processed_stripe_events (
  event_id      text PRIMARY KEY,
  processed_at  timestamptz NOT NULL DEFAULT now()
);
-- No RLS — only service role accesses this table via the webhook handler.
