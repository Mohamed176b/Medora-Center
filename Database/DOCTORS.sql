-- Create the doctors table
CREATE TABLE doctors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  specialization TEXT,
  bio TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;

-- Super Admin: Full access (SELECT, INSERT, UPDATE, DELETE)
CREATE POLICY "Super Admin full access to doctors"
  ON doctors FOR ALL
  USING (EXISTS (SELECT 1 FROM dashboard_users du WHERE du.id = auth.uid() AND du.role = 'super-admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM dashboard_users du WHERE du.id = auth.uid() AND du.role = 'super-admin'));

-- Admin: Permissions for SELECT, INSERT, UPDATE, DELETE
CREATE POLICY "Admin manage select doctors"
  ON doctors FOR SELECT
  USING (EXISTS (SELECT 1 FROM dashboard_users du WHERE du.id = auth.uid() AND du.role = 'admin'));

CREATE POLICY "Admin manage insert doctors"
  ON doctors FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM dashboard_users du WHERE du.id = auth.uid() AND du.role = 'admin'));

CREATE POLICY "Admin manage update doctors"
  ON doctors FOR UPDATE
  USING (EXISTS (SELECT 1 FROM dashboard_users du WHERE du.id = auth.uid() AND du.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM dashboard_users du WHERE du.id = auth.uid() AND du.role = 'admin'));

CREATE POLICY "Admin manage delete doctors"
  ON doctors FOR DELETE
  USING (EXISTS (SELECT 1 FROM dashboard_users du WHERE du.id = auth.uid() AND du.role = 'admin'));

-- Viewer: Read-only access
CREATE POLICY "Viewer read doctors"
  ON doctors FOR SELECT
  USING (EXISTS (SELECT 1 FROM dashboard_users du WHERE du.id = auth.uid() AND du.role = 'viewer'));

-- Public: Read-only access to active doctors
CREATE POLICY "Public read active doctors"
  ON doctors FOR SELECT
  USING (is_active = TRUE);