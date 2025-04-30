CREATE TABLE services (
    id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,        
    description TEXT NOT NULL,           
    icon VARCHAR(255),                   
    slug VARCHAR(100) UNIQUE,           
    display_order INT DEFAULT 0,         
    is_active BOOLEAN DEFAULT TRUE,      
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_services_timestamp
BEFORE UPDATE ON services
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

ALTER TABLE services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super Admin full access to services"
  ON services FOR ALL
  USING (EXISTS (SELECT 1 FROM dashboard_users du WHERE du.id = auth.uid() AND du.role = 'super-admin'));

CREATE POLICY "Admin manage select services"
  ON services FOR SELECT
  USING (EXISTS (SELECT 1 FROM dashboard_users du WHERE du.id = auth.uid() AND du.role = 'admin'));

CREATE POLICY "Admin manage insert services"
  ON services FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM dashboard_users du WHERE du.id = auth.uid() AND du.role = 'admin'));

CREATE POLICY "Admin manage update services"
  ON services FOR UPDATE
  USING (EXISTS (SELECT 1 FROM dashboard_users du WHERE du.id = auth.uid() AND du.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM dashboard_users du WHERE du.id = auth.uid() AND du.role = 'admin'));

CREATE POLICY "Admin manage delete services"
  ON services FOR DELETE
  USING (EXISTS (SELECT 1 FROM dashboard_users du WHERE du.id = auth.uid() AND du.role = 'admin'));

CREATE POLICY "Viewer read services"
  ON services FOR SELECT
  USING (EXISTS (SELECT 1 FROM dashboard_users du WHERE du.id = auth.uid() AND du.role = 'viewer'));

CREATE POLICY "Public read active services"
  ON services FOR SELECT
  USING (is_active = TRUE);

CREATE POLICY "Patients can view active services"
  ON services FOR SELECT
  USING (
    auth.uid() IS NOT NULL AND
    is_active = true
  );


