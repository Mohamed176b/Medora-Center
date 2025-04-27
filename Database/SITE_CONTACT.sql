-- 1. إنشاء جدول معلومات التواصل
CREATE TABLE site_contact (
  id SERIAL PRIMARY KEY,
  phone TEXT NOT NULL,             -- رقم هاتف المركز
  facebook_url TEXT,               -- رابط فيسبوك
  instagram_url TEXT,              -- رابط إنستغرام
  x_url TEXT,                      -- رابط X (تويتر سابقاً)
  threads_url TEXT,                -- رابط ثريدس
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  latitude NUMERIC,
  longitude NUMERIC,
  email VARCHAR(100),
  address VARCHAR(255),
  working_hours VARCHAR(255)
);

-- 2. تفعيل RLS على الجدول
ALTER TABLE site_contact ENABLE ROW LEVEL SECURITY;

-- 3. سياسات الوصول

-- 3.1. admins و super-admins لهم كامل الصلاحيات (CRUD)
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

-- 3.2. viewer (مشاهد) والـ public (الزائر العام) يمكنهم قراءة البيانات فقط
CREATE POLICY "public_select_site_contact"
  ON site_contact
  FOR SELECT
  USING (true);

-- لا توجد سياسات لـ INSERT, UPDATE, DELETE للـ public أو viewer → تُرفض هذه العمليات افتراضيًا
