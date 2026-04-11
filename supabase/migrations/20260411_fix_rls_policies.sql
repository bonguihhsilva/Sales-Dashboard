-- Allow authenticated users to read periods (needed for PeriodSelector, UploadModal, ExportButton)
DROP POLICY IF EXISTS "periods_authenticated_read" ON periods;
CREATE POLICY "periods_authenticated_read" ON periods
  FOR SELECT TO authenticated USING (true);

-- Allow authenticated users to read goals (needed for metas tab and ranking filter)
DROP POLICY IF EXISTS "goals_authenticated_read" ON goals;
CREATE POLICY "goals_authenticated_read" ON goals
  FOR SELECT TO authenticated USING (true);
