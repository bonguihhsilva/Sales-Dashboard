-- Vendors that should never appear in the ranking or have data imported
CREATE TABLE IF NOT EXISTS vendor_exclusions (
  vendor_id TEXT PRIMARY KEY,
  reason    TEXT
);

-- Grant service role access
ALTER TABLE vendor_exclusions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service role full access" ON vendor_exclusions
  USING (true) WITH CHECK (true);
