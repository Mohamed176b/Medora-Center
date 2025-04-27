CREATE TABLE services (
    id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,         -- عنوان الخدمة
    description TEXT NOT NULL,           -- وصف مختصر
    icon VARCHAR(255),                   -- مسار الأيقونة (اختياري)
    slug VARCHAR(100) UNIQUE,            -- رابط مميز للخدمة
    display_order INT DEFAULT 0,         -- ترتيب العرض
    is_active BOOLEAN DEFAULT TRUE,      -- حالة الخدمة (نشطة / غير نشطة)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create trigger function for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = CURRENT_TIMESTAMP;
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to services table
CREATE TRIGGER update_services_timestamp
BEFORE UPDATE ON services
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- Enable Row Level Security
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- Super Admin: Full access (SELECT, INSERT, UPDATE, DELETE)
CREATE POLICY "Super Admin full access to services"
  ON services FOR ALL
  USING (EXISTS (SELECT 1 FROM dashboard_users du WHERE du.id = auth.uid() AND du.role = 'super-admin'));

-- Admin: Permissions for SELECT, INSERT, UPDATE, DELETE
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

-- Viewer: Read-only access
CREATE POLICY "Viewer read services"
  ON services FOR SELECT
  USING (EXISTS (SELECT 1 FROM dashboard_users du WHERE du.id = auth.uid() AND du.role = 'viewer'));

CREATE POLICY "Public read active services"
  ON services FOR SELECT
  USING (is_active = TRUE);

-- المريض: إمكانية الاطلاع على الخدمات النشطة فقط
-- للسماح للمرضى بعرض الخدمات المتاحة لحجز المواعيد
CREATE POLICY "Patients can view active services"
  ON services FOR SELECT
  USING (
    -- العميل مسجل الدخول ومصادق عليه
    auth.uid() IS NOT NULL AND
    -- الخدمة نشطة
    is_active = true
  );


