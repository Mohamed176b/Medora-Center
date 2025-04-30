CREATE TABLE pages_content (
  page_key TEXT PRIMARY KEY,         
  background_image_url TEXT,       
  catchy_title TEXT,        
  simple_description TEXT,
  center_overview TEXT,         
  years_experience INT,           
  why_choose_us TEXT,                 
  short_history TEXT,                
  center_image_url TEXT,              
  long_term_goal TEXT,             
  mission_statement TEXT,            
  patients_served_count INT,          
  departments_count INT,              
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE VIEW pages_content_view AS
SELECT 
  pc.*,
  (SELECT COUNT(*) FROM doctors) AS doctors_count
FROM 
  pages_content pc;


ALTER TABLE pages_content ENABLE ROW LEVEL SECURITY;

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

  
CREATE POLICY "Public read pages_content"
  ON pages_content FOR SELECT
  USING (true);