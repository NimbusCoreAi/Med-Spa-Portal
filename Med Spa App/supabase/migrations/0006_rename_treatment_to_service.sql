-- Migration: 0006_rename_treatment_to_service.sql
-- Rename treatment_type to service_type for vertical-agnostic naming

ALTER TABLE appointments RENAME COLUMN treatment_type TO service_type;
