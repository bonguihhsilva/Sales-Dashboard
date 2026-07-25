-- supabase/migrations/20260725000001_hr_permissions_day_off_vacation.sql
-- Extends hr_permissions to cover vendor-initiated day-off and vacation requests,
-- reusing the existing pending/approved/denied review flow instead of new tables.

ALTER TABLE hr_permissions
  DROP CONSTRAINT IF EXISTS hr_permissions_type_check;

ALTER TABLE hr_permissions
  ADD CONSTRAINT hr_permissions_type_check
  CHECK (type IN ('medical_certificate','appointment','document','day_off','vacation'));

ALTER TABLE hr_permissions
  ADD COLUMN IF NOT EXISTS end_date date;

ALTER TABLE hr_permissions
  ADD CONSTRAINT hr_permissions_end_date_after_requested
  CHECK (end_date IS NULL OR end_date >= requested_date);

COMMENT ON COLUMN hr_permissions.end_date IS 'Only used when type = vacation, to represent the requested date range end (requested_date is the range start).';
