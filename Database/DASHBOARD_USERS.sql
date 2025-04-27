-- إنشاء ENUM خاص بالأدوار (roles)
CREATE TYPE user_role AS ENUM ('super-admin', 'admin', 'editor', 'moderator', 'viewer');

-- إنشاء جدول dashboard_users
CREATE TABLE dashboard_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,  -- الربط مع auth.users
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role user_role NOT NULL DEFAULT 'viewer',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- تفعيل RLS (التحكم في الوصول على مستوى الصفوف)
ALTER TABLE dashboard_users ENABLE ROW LEVEL SECURITY;

-- سياسة تسمح لـ Super-Admin بكل الصلاحيات
CREATE POLICY "Allow Super-Admin to select everything"
  ON dashboard_users
  FOR SELECT
  USING (role = 'super-admin');

CREATE POLICY "Allow Super-Admin to insert everything"
  ON dashboard_users
  FOR INSERT
  WITH CHECK (role = 'super-admin');

CREATE POLICY "Allow Super-Admin to update everything"
  ON dashboard_users
  FOR UPDATE
  USING (role = 'super-admin');

CREATE POLICY "Allow Super-Admin to delete everything"
  ON dashboard_users
  FOR DELETE
  USING (role = 'super-admin');

-- سياسة تسمح لـ Admin بقراءة وتعديل بيانات الأطباء، الخدمات، المواعيد، والمدونة
-- CREATE POLICY "Allow Admin to select doctors, services, appointments, and blog"
--   ON dashboard_users
--   FOR SELECT
--   USING (role = 'admin');

-- CREATE POLICY "Allow Admin to insert doctors, services, appointments, and blog"
--   ON dashboard_users
--   FOR INSERT
--   WITH CHECK (role = 'admin');

-- CREATE POLICY "Allow Admin to update doctors, services, appointments, and blog"
--   ON dashboard_users
--   FOR UPDATE
--   USING (role = 'admin');

-- CREATE POLICY "Allow Admin to delete doctors, services, appointments, and blog"
--   ON dashboard_users
--   FOR DELETE
--   USING (role = 'admin');

-- سياسة تسمح لـ Editor بإجراء CRUD على المدونة فقط
-- CREATE POLICY "Allow Editor to select blog"
--   ON dashboard_users
--   FOR SELECT
--   USING (role = 'editor');

-- CREATE POLICY "Allow Editor to insert blog"
--   ON dashboard_users
--   FOR INSERT
--   WITH CHECK (role = 'editor');

-- CREATE POLICY "Allow Editor to update blog"
--   ON dashboard_users
--   FOR UPDATE
--   USING (role = 'editor');

-- CREATE POLICY "Allow Editor to delete blog"
--   ON dashboard_users
--   FOR DELETE
--   USING (role = 'editor');

-- سياسة تسمح لـ Moderator بمراجعة المواعيد ومشاهدتها
-- CREATE POLICY "Allow Moderator to review appointments, view messages"
--   ON dashboard_users
--   FOR SELECT
--   USING (role = 'moderator');

-- CREATE POLICY "Allow Moderator to cancel appointments, view messages"
--   ON dashboard_users
--   FOR UPDATE
--   USING (role = 'moderator');

-- -- سياسة تمنع الـ Moderator من التعديل على بيانات غير المواعيد
-- CREATE POLICY "Allow Moderator to view only"
--   ON dashboard_users
--   FOR DELETE
--   USING (role = 'moderator' AND false);  -- لا يمكنه حذف أي بيانات

-- سياسة تسمح لـ Viewer بقراءة البيانات فقط (Read-Only)
CREATE POLICY "Allow Viewer to view data"
  ON dashboard_users
  FOR SELECT
  USING (role = 'viewer');
------------------------------
CREATE POLICY "Allow admin to view data"
  ON dashboard_users
  FOR SELECT
  USING (role = 'admin');

CREATE POLICY "Allow editor to view data"
  ON dashboard_users
  FOR SELECT
  USING (role = 'editor');

CREATE POLICY "Allow moderator to view data"
  ON dashboard_users
  FOR SELECT
  USING (role = 'moderator');

-- سياسة تسمح للجميع بقراءة البيانات
-- CREATE POLICY "Allow public read access" ON public.dashboard_users
--   FOR SELECT USING (true);


-- للحصول على المعرف الخاص بالمستخدم باستخدام البريد الإلكتروني
CREATE OR REPLACE FUNCTION get_user_id_by_email(email_input TEXT)
RETURNS UUID AS $$
DECLARE
  user_id UUID;
BEGIN
  SELECT id INTO user_id FROM auth.users WHERE email = email_input;
  RETURN user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- إنشاء تسلسل (Sequence) جديد في حال رغبتك في إضافة ID يدويًا
-- ولكن لا حاجة لذلك هنا لأننا نستخدم UUID.
-- سيتم التعامل مع الـ UUID تلقائيًا من خلال `auth.users`

-- في حال كنت تريد إضافة المستخدمين يدويًا (بإدخال بيانات للمستخدمين الجدد):
-- بمجرد إضافة مستخدمين جدد إلى جدول `auth.users`، قم بتحديد الدور `role` لهذا المستخدم في جدول `dashboard_users`.

-- مثال لإضافة مستخدم جديد مع الدور:
-- INSERT INTO dashboard_users (id, full_name, email, role)
-- VALUES ('04052e14-7fa4-408e-a3df-b856020dc0f4', 'Mohamed Elshafey', 'moshafey18@gmail.com', 'super-admin');





-- وظائف RPC لتجاوز سياسات الأمان في جدول dashboard_users

-- وظيفة لإضافة مستخدم إداري جديد
CREATE OR REPLACE FUNCTION add_admin_user(
  admin_id UUID,
  admin_full_name TEXT,
  admin_email TEXT,
  admin_role TEXT,
  admin_is_active BOOLEAN
)
RETURNS BOOLEAN AS $$
DECLARE
  current_user_role TEXT;
BEGIN
  -- التحقق من دور المستخدم الحالي (يجب أن يكون سوبر أدمن)
  SELECT role::TEXT INTO current_user_role FROM dashboard_users WHERE id = auth.uid();
  
  IF current_user_role IS NULL OR current_user_role != 'super-admin' THEN
    RAISE EXCEPTION 'لا تملك الصلاحيات الكافية للقيام بهذه العملية. العملية تتطلب دور السوبر أدمن.';
    RETURN FALSE;
  END IF;

  -- تحويل النوع النصي للدور إلى ENUM
  INSERT INTO dashboard_users (id, full_name, email, role, is_active)
  VALUES (
    admin_id,
    admin_full_name,
    admin_email,
    admin_role::user_role,
    admin_is_active
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- وظيفة لتحديث بيانات مستخدم إداري
CREATE OR REPLACE FUNCTION update_admin_user(
  admin_id UUID,
  admin_full_name TEXT,
  admin_role TEXT,
  admin_is_active BOOLEAN
)
RETURNS BOOLEAN AS $$
DECLARE
  current_user_role TEXT;
  target_admin_role TEXT;
BEGIN
  -- التحقق من دور المستخدم الحالي (يجب أن يكون سوبر أدمن)
  SELECT role::TEXT INTO current_user_role FROM dashboard_users WHERE id = auth.uid();
  
  IF current_user_role IS NULL OR current_user_role != 'super-admin' THEN
    RAISE EXCEPTION 'لا تملك الصلاحيات الكافية للقيام بهذه العملية. العملية تتطلب دور السوبر أدمن.';
    RETURN FALSE;
  END IF;

  -- التحقق مما إذا كان المستخدم المستهدف سوبر أدمن وتحاول تغيير دوره
  SELECT role::TEXT INTO target_admin_role FROM dashboard_users WHERE id = admin_id;
  
  IF target_admin_role = 'super-admin' AND admin_role != 'super-admin' THEN
    RAISE EXCEPTION 'لا يمكن تغيير دور السوبر أدمن.';
    RETURN FALSE;
  END IF;

  -- تحويل النوع النصي للدور إلى ENUM
  UPDATE dashboard_users
  SET 
    full_name = admin_full_name,
    role = admin_role::user_role,
    is_active = admin_is_active
  WHERE id = admin_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- وظيفة لحذف مستخدم إداري مع حذفه من نظام المصادقة أيضاً
CREATE OR REPLACE FUNCTION delete_admin_user(
  admin_id UUID,
  delete_auth_user BOOLEAN DEFAULT FALSE
)
RETURNS BOOLEAN AS $$
DECLARE
  current_user_role TEXT;
  target_admin_role TEXT;
BEGIN
  -- التحقق من دور المستخدم الحالي (يجب أن يكون سوبر أدمن)
  SELECT role::TEXT INTO current_user_role FROM dashboard_users WHERE id = auth.uid();
  
  IF current_user_role IS NULL OR current_user_role != 'super-admin' THEN
    RAISE EXCEPTION 'لا تملك الصلاحيات الكافية للقيام بهذه العملية. العملية تتطلب دور السوبر أدمن.';
    RETURN FALSE;
  END IF;

  -- التحقق مما إذا كان المستخدم المستهدف سوبر أدمن
  SELECT role::TEXT INTO target_admin_role FROM dashboard_users WHERE id = admin_id;
  
  IF target_admin_role = 'super-admin' THEN
    RAISE EXCEPTION 'لا يمكن حذف مستخدم بدور السوبر أدمن.';
    RETURN FALSE;
  END IF;

  -- حذف المستخدم من جدول dashboard_users
  DELETE FROM dashboard_users
  WHERE id = admin_id;

  -- إذا كان المطلوب حذف المستخدم من نظام المصادقة أيضاً
  IF delete_auth_user THEN
    BEGIN
      -- محاولة حذف المستخدم من نظام المصادقة
      -- في حالة وجود قيود قد تمنع الحذف، سيتم التقاط الاستثناء
      DELETE FROM auth.users
      WHERE id = admin_id;
      
      EXCEPTION WHEN OTHERS THEN
        -- تسجيل معلومات الخطأ ولكن الاستمرار بنجاح العملية لأن المسؤول تم حذفه من dashboard_users
        RAISE NOTICE 'تم حذف المستخدم من نظام المسؤولين ولكن لم يتم حذفه من نظام المصادقة: %', SQLERRM;
    END;
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- وظيفة لاسترجاع جميع المسؤولين
CREATE OR REPLACE FUNCTION get_all_admins()
RETURNS SETOF dashboard_users AS $$
BEGIN
  -- إرجاع جميع المسؤولين مرتبين حسب تاريخ الإنشاء
  RETURN QUERY SELECT * FROM dashboard_users ORDER BY created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ملاحظة هامة:
-- SECURITY DEFINER يعني أن الوظيفة تعمل بصلاحيات المستخدم الذي أنشأها (عادة مالك قاعدة البيانات)
-- وليس المستخدم الذي يستدعيها، وهذا يسمح بتجاوز سياسات الأمان (RLS).
-- ومع ذلك، قمنا بإضافة طبقة إضافية من التحقق داخل الوظائف للتأكد من أن المستخدم لديه الصلاحيات المناسبة. 