CREATE TYPE user_role AS ENUM ('super-admin', 'admin', 'editor', 'moderator', 'viewer');

CREATE TABLE dashboard_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,  
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role user_role NOT NULL DEFAULT 'viewer',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

ALTER TABLE dashboard_users ENABLE ROW LEVEL SECURITY;

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

CREATE POLICY "Allow Viewer to view data"
  ON dashboard_users
  FOR SELECT
  USING (role = 'viewer');


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


CREATE OR REPLACE FUNCTION get_user_id_by_email(email_input TEXT)
RETURNS UUID AS $$
DECLARE
  user_id UUID;
BEGIN
  SELECT id INTO user_id FROM auth.users WHERE email = email_input;
  RETURN user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- INSERT INTO dashboard_users (id, full_name, email, role)
-- VALUES ('04052e14-7fa4-408e-a3df-b856020dc0f4', 'Mohamed Elshafey', 'moshafey18@gmail.com', 'super-admin');


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
  SELECT role::TEXT INTO current_user_role FROM dashboard_users WHERE id = auth.uid();
  
  IF current_user_role IS NULL OR current_user_role != 'super-admin' THEN
    RAISE EXCEPTION 'لا تملك الصلاحيات الكافية للقيام بهذه العملية. العملية تتطلب دور السوبر أدمن.';
    RETURN FALSE;
  END IF;

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
  SELECT role::TEXT INTO current_user_role FROM dashboard_users WHERE id = auth.uid();
  
  IF current_user_role IS NULL OR current_user_role != 'super-admin' THEN
    RAISE EXCEPTION 'لا تملك الصلاحيات الكافية للقيام بهذه العملية. العملية تتطلب دور السوبر أدمن.';
    RETURN FALSE;
  END IF;

  SELECT role::TEXT INTO target_admin_role FROM dashboard_users WHERE id = admin_id;
  
  IF target_admin_role = 'super-admin' AND admin_role != 'super-admin' THEN
    RAISE EXCEPTION 'لا يمكن تغيير دور السوبر أدمن.';
    RETURN FALSE;
  END IF;

  UPDATE dashboard_users
  SET 
    full_name = admin_full_name,
    role = admin_role::user_role,
    is_active = admin_is_active
  WHERE id = admin_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION delete_admin_user(
  admin_id UUID,
  delete_auth_user BOOLEAN DEFAULT FALSE
)
RETURNS BOOLEAN AS $$
DECLARE
  current_user_role TEXT;
  target_admin_role TEXT;
BEGIN
  SELECT role::TEXT INTO current_user_role FROM dashboard_users WHERE id = auth.uid();
  
  IF current_user_role IS NULL OR current_user_role != 'super-admin' THEN
    RAISE EXCEPTION 'لا تملك الصلاحيات الكافية للقيام بهذه العملية. العملية تتطلب دور السوبر أدمن.';
    RETURN FALSE;
  END IF;

  SELECT role::TEXT INTO target_admin_role FROM dashboard_users WHERE id = admin_id;
  
  IF target_admin_role = 'super-admin' THEN
    RAISE EXCEPTION 'لا يمكن حذف مستخدم بدور السوبر أدمن.';
    RETURN FALSE;
  END IF;

  DELETE FROM dashboard_users
  WHERE id = admin_id;

  IF delete_auth_user THEN
    BEGIN
      DELETE FROM auth.users
      WHERE id = admin_id;
      
      EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'تم حذف المستخدم من نظام المسؤولين ولكن لم يتم حذفه من نظام المصادقة: %', SQLERRM;
    END;
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_all_admins()
RETURNS SETOF dashboard_users AS $$
BEGIN
  RETURN QUERY SELECT * FROM dashboard_users ORDER BY created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
