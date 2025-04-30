CREATE TABLE IF NOT EXISTS site_views (
    id SERIAL PRIMARY KEY,
    ip_address VARCHAR(45) NOT NULL,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE site_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY allow_insert_site_views ON site_views
  FOR INSERT WITH CHECK (true);

CREATE POLICY allow_select_site_views ON site_views
  FOR SELECT USING (true);

CREATE POLICY deny_update_site_views ON site_views
  FOR UPDATE USING (false);
CREATE POLICY deny_delete_site_views ON site_views
  FOR DELETE USING (false);
