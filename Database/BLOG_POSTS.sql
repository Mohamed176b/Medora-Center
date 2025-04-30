CREATE TABLE blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID REFERENCES dashboard_users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL,
  summary TEXT,
  image_url TEXT,
  is_published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  attachments JSONB
);
CREATE INDEX blog_posts_slug_idx ON blog_posts(slug);

CREATE OR REPLACE FUNCTION update_blog_timestamp()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = timezone('utc', now());
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_blog_timestamp
BEFORE UPDATE ON blog_posts
FOR EACH ROW
EXECUTE FUNCTION update_blog_timestamp();

ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super Admin full access to blog_posts"
  ON blog_posts FOR ALL
  USING (EXISTS (
    SELECT 1 FROM dashboard_users WHERE id = auth.uid() AND role = 'super-admin'
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM dashboard_users WHERE id = auth.uid() AND role = 'super-admin'
  ));

CREATE POLICY "Admin manage blog_posts"
  ON blog_posts FOR ALL
  USING (EXISTS (
    SELECT 1 FROM dashboard_users WHERE id = auth.uid() AND role = 'admin'
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM dashboard_users WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Editor manage select blog_posts"
  ON blog_posts FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM dashboard_users WHERE id = auth.uid() AND role = 'editor'
  ));

CREATE POLICY "Editor manage insert blog_posts"
  ON blog_posts FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM dashboard_users WHERE id = auth.uid() AND role = 'editor'
  ));

CREATE POLICY "Editor manage update blog_posts"
  ON blog_posts FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM dashboard_users WHERE id = auth.uid() AND role = 'editor'
  ));

CREATE POLICY "Editor manage delete blog_posts"
  ON blog_posts FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM dashboard_users WHERE id = auth.uid() AND role = 'editor'
  ));

CREATE POLICY "Viewer read blog_posts"
  ON blog_posts FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM dashboard_users WHERE id = auth.uid() AND role = 'viewer'
  ));

CREATE POLICY "Public read published blog_posts"
  ON blog_posts FOR SELECT
  USING (is_published = true);

CREATE TABLE blog_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

ALTER TABLE blog_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super Admin and Admin full access to blog_categories"
  ON blog_categories FOR ALL
  USING (EXISTS (
    SELECT 1 FROM dashboard_users 
    WHERE id = auth.uid() AND role IN ('super-admin', 'admin')
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM dashboard_users 
    WHERE id = auth.uid() AND role IN ('super-admin', 'admin')
  ));

CREATE POLICY "Editor full access to blog_categories"
  ON blog_categories FOR ALL
  USING (EXISTS (
    SELECT 1 FROM dashboard_users WHERE id = auth.uid() AND role = 'editor'
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM dashboard_users WHERE id = auth.uid() AND role = 'editor'
  ));

CREATE POLICY "Everyone can read blog_categories"
  ON blog_categories FOR SELECT
  USING (true);

CREATE TABLE blog_posts_categories (
  post_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, category_id),
  viewer_ip TEXT,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  session_id TEXT
);

ALTER TABLE blog_posts_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super Admin and Admin full access to blog_posts_categories"
  ON blog_posts_categories FOR ALL
  USING (EXISTS (
    SELECT 1 FROM dashboard_users 
    WHERE id = auth.uid() AND role IN ('super-admin', 'admin')
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM dashboard_users 
    WHERE id = auth.uid() AND role IN ('super-admin', 'admin')
  ));

CREATE POLICY "Editor full access to blog_posts_categories"
  ON blog_posts_categories FOR ALL
  USING (EXISTS (
    SELECT 1 FROM dashboard_users WHERE id = auth.uid() AND role = 'editor'
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM dashboard_users WHERE id = auth.uid() AND role = 'editor'
  ));

CREATE POLICY "Public read blog_posts_categories"
  ON blog_posts_categories FOR SELECT
  USING (true);

INSERT INTO blog_categories (name, slug) VALUES
('عام', 'general'),
('صحة', 'health'),
('نصائح طبية', 'medical-advice'),
('أخبار', 'news');

CREATE TABLE blog_post_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE,
  viewer_ip TEXT NOT NULL,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

CREATE INDEX blog_post_views_post_id_idx ON blog_post_views(post_id);
CREATE INDEX blog_post_views_viewer_ip_idx ON blog_post_views(viewer_ip);

ALTER TABLE blog_post_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super Admin and Admin full access to blog_post_views"
  ON blog_post_views FOR ALL
  USING (EXISTS (
    SELECT 1 FROM dashboard_users 
    WHERE id = auth.uid() AND role IN ('super-admin', 'admin')
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM dashboard_users 
    WHERE id = auth.uid() AND role IN ('super-admin', 'admin')
  ));

CREATE POLICY "Everyone can insert blog post views"
  ON blog_post_views FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Everyone can read blog post views"
  ON blog_post_views FOR SELECT
  USING (true);