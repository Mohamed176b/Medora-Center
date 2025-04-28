-- Create the doctors table
CREATE TABLE doctors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
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

-- Create doctor_services junction table
CREATE TABLE IF NOT EXISTS doctor_services (
  doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE,
  service_id INTEGER REFERENCES services(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (doctor_id, service_id)
);

-- Enable Row Level Security for doctor_services
ALTER TABLE doctor_services ENABLE ROW LEVEL SECURITY;

-- Super Admin: Full access to doctor_services
CREATE POLICY "Super Admin full access to doctor_services"
  ON doctor_services FOR ALL
  USING (EXISTS (SELECT 1 FROM dashboard_users du WHERE du.id = auth.uid() AND du.role = 'super-admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM dashboard_users du WHERE du.id = auth.uid() AND du.role = 'super-admin'));

-- Admin: Full access to doctor_services
CREATE POLICY "Admin manage select doctor_services"
  ON doctor_services FOR SELECT
  USING (EXISTS (SELECT 1 FROM dashboard_users du WHERE du.id = auth.uid() AND du.role = 'admin'));

CREATE POLICY "Admin manage insert doctor_services"
  ON doctor_services FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM dashboard_users du WHERE du.id = auth.uid() AND du.role = 'admin'));

CREATE POLICY "Admin manage update doctor_services"
  ON doctor_services FOR UPDATE
  USING (EXISTS (SELECT 1 FROM dashboard_users du WHERE du.id = auth.uid() AND du.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM dashboard_users du WHERE du.id = auth.uid() AND du.role = 'admin'));

CREATE POLICY "Admin manage delete doctor_services"
  ON doctor_services FOR DELETE
  USING (EXISTS (SELECT 1 FROM dashboard_users du WHERE du.id = auth.uid() AND du.role = 'admin'));

-- Viewer: Read-only access to doctor_services
CREATE POLICY "Viewer read doctor_services"
  ON doctor_services FOR SELECT
  USING (EXISTS (SELECT 1 FROM dashboard_users du WHERE du.id = auth.uid() AND du.role = 'viewer'));

-- Public: Read-only access to active doctors' services
CREATE POLICY "Public read doctor_services"
  ON doctor_services FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM doctors d 
      WHERE d.id = doctor_services.doctor_id 
      AND d.is_active = true
    )
  );

-- Create trigger function for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_doctor_services_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to doctor_services table
CREATE TRIGGER update_doctor_services_timestamp
  BEFORE UPDATE ON doctor_services
  FOR EACH ROW
  EXECUTE FUNCTION update_doctor_services_timestamp();
