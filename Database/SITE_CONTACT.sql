CREATE TABLE site_contact (
  id SERIAL PRIMARY KEY,
  phone TEXT NOT NULL,             
  facebook_url TEXT,               
  instagram_url TEXT,             
  x_url TEXT,                      
  threads_url TEXT,                
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  latitude NUMERIC,
  longitude NUMERIC,
  email VARCHAR(100),
  address VARCHAR(255),
  working_hours VARCHAR(255)
);

ALTER TABLE site_contact ENABLE ROW LEVEL SECURITY;

CREATE POLICY "full_access_for_admins"
  ON site_contact
  FOR ALL
  USING (
    EXISTS (
      SELECT 1
      FROM dashboard_users du
      WHERE du.id = auth.uid()
        AND du.role IN ('admin','super-admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM dashboard_users du
      WHERE du.id = auth.uid()
        AND du.role IN ('admin','super-admin')
    )
  );

CREATE POLICY "public_select_site_contact"
  ON site_contact
  FOR SELECT
  USING (true);

