-- جدول تتبع مشاهدات الموقع بالـ IP
CREATE TABLE IF NOT EXISTS site_views (
    id SERIAL PRIMARY KEY,
    ip_address VARCHAR(45) NOT NULL,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- تفعيل سياسات الأمان على مستوى الصفوف (RLS)
ALTER TABLE site_views ENABLE ROW LEVEL SECURITY;

-- سياسة: السماح للجميع بالإضافة (insert)
CREATE POLICY allow_insert_site_views ON site_views
  FOR INSERT WITH CHECK (true);

-- سياسة: السماح للجميع بالاستعلام (select)
CREATE POLICY allow_select_site_views ON site_views
  FOR SELECT USING (true);

-- سياسة: منع التعديل (update) والحذف (delete) للجميع
CREATE POLICY deny_update_site_views ON site_views
  FOR UPDATE USING (false);
CREATE POLICY deny_delete_site_views ON site_views
  FOR DELETE USING (false);
