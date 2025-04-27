-- Create the blog_posts table
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
-- Create index for faster slug lookup
CREATE INDEX blog_posts_slug_idx ON blog_posts(slug);

-- Create a trigger to update the updated_at timestamp
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

-- Enable Row Level Security
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Super Admin: Full access (SELECT, INSERT, UPDATE, DELETE)
CREATE POLICY "Super Admin full access to blog_posts"
  ON blog_posts FOR ALL
  USING (EXISTS (
    SELECT 1 FROM dashboard_users WHERE id = auth.uid() AND role = 'super-admin'
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM dashboard_users WHERE id = auth.uid() AND role = 'super-admin'
  ));

-- Admin: Full access to blog posts
CREATE POLICY "Admin manage blog_posts"
  ON blog_posts FOR ALL
  USING (EXISTS (
    SELECT 1 FROM dashboard_users WHERE id = auth.uid() AND role = 'admin'
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM dashboard_users WHERE id = auth.uid() AND role = 'admin'
  ));

-- Editor: Permissions for SELECT, INSERT, UPDATE, DELETE
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

-- Viewer: Read-only access
CREATE POLICY "Viewer read blog_posts"
  ON blog_posts FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM dashboard_users WHERE id = auth.uid() AND role = 'viewer'
  ));

-- Public: Can only read published posts
CREATE POLICY "Public read published blog_posts"
  ON blog_posts FOR SELECT
  USING (is_published = true);

-- Create blog categories table
CREATE TABLE blog_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Enable Row Level Security
ALTER TABLE blog_categories ENABLE ROW LEVEL SECURITY;

-- Super Admin and Admin: Full access
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

-- Editor: Full access
CREATE POLICY "Editor full access to blog_categories"
  ON blog_categories FOR ALL
  USING (EXISTS (
    SELECT 1 FROM dashboard_users WHERE id = auth.uid() AND role = 'editor'
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM dashboard_users WHERE id = auth.uid() AND role = 'editor'
  ));

-- Viewer and Public: Read-only access
CREATE POLICY "Everyone can read blog_categories"
  ON blog_categories FOR SELECT
  USING (true);

-- Create junction table for many-to-many relationship between posts and categories
CREATE TABLE blog_posts_categories (
  post_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE,
  category_id UUID REFERENCES blog_categories(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, category_id)
);

-- Enable Row Level Security
ALTER TABLE blog_posts_categories ENABLE ROW LEVEL SECURITY;

-- Super Admin and Admin: Full access
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

-- Editor: Full access
CREATE POLICY "Editor full access to blog_posts_categories"
  ON blog_posts_categories FOR ALL
  USING (EXISTS (
    SELECT 1 FROM dashboard_users WHERE id = auth.uid() AND role = 'editor'
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM dashboard_users WHERE id = auth.uid() AND role = 'editor'
  ));

-- Public: Read-only access
CREATE POLICY "Public read blog_posts_categories"
  ON blog_posts_categories FOR SELECT
  USING (true);

-- Insert some default categories
INSERT INTO blog_categories (name, slug) VALUES
('عام', 'general'),
('صحة', 'health'),
('نصائح طبية', 'medical-advice'),
('أخبار', 'news'); 