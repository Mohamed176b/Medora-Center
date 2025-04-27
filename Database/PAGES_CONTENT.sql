CREATE TABLE pages_content (
  page_key TEXT PRIMARY KEY,          -- 'home' أو 'about_us'
  background_image_url TEXT,          -- رابط صورة الخلفية
  catchy_title TEXT,                  -- عنوان جذاب
  simple_description TEXT,            -- وصف بسيط
  center_overview TEXT,               -- نبذة عن المركز
  years_experience INT,               -- عدد سنوات الخبرة
  why_choose_us TEXT,                 -- لماذا يختاروننا المرضى
  short_history TEXT,                 -- نص قصير عن تاريخ أو هدف المركز
  center_image_url TEXT,              -- رابط صورة للمركز
  long_term_goal TEXT,                -- هدف المركز الطبي على المدى البعيد
  mission_statement TEXT,             -- الرسالة التي يسعى المركز لتحقيقها
  patients_served_count INT,          -- عدد المرضى الذين خدمهم المركز
  departments_count INT,              -- عدد الأقسام
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE VIEW pages_content_view AS
SELECT 
  pc.*,
  (SELECT COUNT(*) FROM doctors) AS doctors_count
FROM 
  pages_content pc;


ALTER TABLE pages_content ENABLE ROW LEVEL SECURITY;

-- 3. سياسات الوصول (RLS)

-- 3.1. السماح لـ super-admin و admin بكل العمليات (SELECT, INSERT, UPDATE, DELETE)
--    شرط الربط: وجود سجل في dashboard_users بنفس auth.uid() والدور واحد من ('super-admin','admin')
CREATE POLICY "Admins full access to pages_content"
  ON pages_content
  FOR ALL
  USING (
    EXISTS (
      SELECT 1
      FROM dashboard_users du
      WHERE du.id = auth.uid()
        AND du.role IN ('super-admin','admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM dashboard_users du
      WHERE du.id = auth.uid()
        AND du.role IN ('super-admin','admin')
    )
  );

-- 3.2. السماح لـ viewer بقراءة المحتوى فقط
CREATE POLICY "Viewers read pages_content"
  ON pages_content
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM dashboard_users du
      WHERE du.id = auth.uid()
        AND du.role = 'viewer'
    )
  );

  
-- Public: Read-only access to pages_content
CREATE POLICY "Public read pages_content"
  ON pages_content FOR SELECT
  USING (true);