CREATE TABLE patients (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  gender TEXT CHECK (gender IN ('male', 'female')) DEFAULT NULL,
  date_of_birth DATE,
  address TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);


ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super Admin full access to patients"
  ON patients FOR ALL
  USING (EXISTS (SELECT 1 FROM dashboard_users WHERE id = auth.uid() AND role = 'super-admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM dashboard_users WHERE id = auth.uid() AND role = 'super-admin'));

-------------------------------------------------------------------
-- Uncomment the following policies if you want to allow admin users to manage patients
-- CREATE POLICY "Admin manage select patients"
--   ON patients FOR SELECT
--   USING (EXISTS (SELECT 1 FROM dashboard_users WHERE id = auth.uid() AND role = 'admin'));

-- CREATE POLICY "Admin manage insert patients"
--   ON patients FOR INSERT
--   WITH CHECK (EXISTS (SELECT 1 FROM dashboard_users WHERE id = auth.uid() AND role = 'admin'));

-- CREATE POLICY "Admin manage update patients"
--   ON patients FOR UPDATE
--   USING (EXISTS (SELECT 1 FROM dashboard_users WHERE id = auth.uid() AND role = 'admin'))
--   WITH CHECK (EXISTS (SELECT 1 FROM dashboard_users WHERE id = auth.uid() AND role = 'admin'));

-- CREATE POLICY "Admin manage delete patients"
--   ON patients FOR DELETE
--   USING (EXISTS (SELECT 1 FROM dashboard_users WHERE id = auth.uid() AND role = 'admin'));
--------------------------------------------------------------------

CREATE POLICY "Viewer read patients"
  ON patients FOR SELECT
  USING (EXISTS (SELECT 1 FROM dashboard_users WHERE id = auth.uid() AND role IN ('viewer', 'moderator')));

CREATE POLICY "Allow authenticated users to insert their own patient record"
  ON patients FOR INSERT
  WITH CHECK (
    auth.uid() = id
  );

CREATE POLICY "Allow authenticated user to view own patient record"
  ON patients FOR SELECT
  USING (
    auth.uid() = id
  );

CREATE POLICY "Allow authenticated user to update own patient record"
  ON patients FOR UPDATE
  USING (
    auth.uid() = id
  )
  WITH CHECK (
    auth.uid() = id
  );
