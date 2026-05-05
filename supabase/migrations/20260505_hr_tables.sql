-- supabase/migrations/20260505_hr_tables.sql

CREATE TABLE hr_free_days (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  issued_at  date NOT NULL DEFAULT current_date,
  expires_at date NOT NULL,
  status     text NOT NULL DEFAULT 'available'
             CHECK (status IN ('available','used','expired','deducted')),
  used_at    date,
  notes      text,
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE hr_absences (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  absence_date date NOT NULL,
  type         text NOT NULL
               CHECK (type IN ('deduct_free_day','justified','no_balance')),
  free_day_id  uuid REFERENCES hr_free_days(id),
  notes        text,
  created_by   uuid REFERENCES profiles(id),
  created_at   timestamptz DEFAULT now()
);

CREATE TABLE hr_vacations (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  start_date date NOT NULL,
  end_date   date NOT NULL,
  notes      text,
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE hr_permissions (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type           text NOT NULL
                 CHECK (type IN ('medical_certificate','appointment','document')),
  requested_date date NOT NULL,
  status         text NOT NULL DEFAULT 'pending'
                 CHECK (status IN ('pending','approved','denied')),
  requested_by   uuid REFERENCES profiles(id),
  reviewed_by    uuid REFERENCES profiles(id),
  reviewed_at    timestamptz,
  notes          text,
  created_at     timestamptz DEFAULT now()
);

-- RLS
ALTER TABLE hr_free_days   ENABLE ROW LEVEL SECURITY;
ALTER TABLE hr_absences    ENABLE ROW LEVEL SECURITY;
ALTER TABLE hr_vacations   ENABLE ROW LEVEL SECURITY;
ALTER TABLE hr_permissions ENABLE ROW LEVEL SECURITY;

-- Admins: full access
CREATE POLICY "adm_hr_free_days"   ON hr_free_days   FOR ALL USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'adm');
CREATE POLICY "adm_hr_absences"    ON hr_absences    FOR ALL USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'adm');
CREATE POLICY "adm_hr_vacations"   ON hr_vacations   FOR ALL USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'adm');
CREATE POLICY "adm_hr_permissions" ON hr_permissions FOR ALL USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'adm');

-- Vendors: read own rows
CREATE POLICY "vendor_read_free_days"   ON hr_free_days   FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "vendor_read_absences"    ON hr_absences    FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "vendor_read_vacations"   ON hr_vacations   FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "vendor_read_permissions" ON hr_permissions FOR SELECT USING (user_id = auth.uid());

-- Vendors: can INSERT own permission requests
CREATE POLICY "vendor_insert_permissions" ON hr_permissions
  FOR INSERT WITH CHECK (user_id = auth.uid() AND requested_by = auth.uid());
