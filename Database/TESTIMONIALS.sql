CREATE TABLE testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  rating INT CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  is_reviewed BOOLEAN DEFAULT FALSE
);

ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super Admin full access to testimonials"
  ON testimonials FOR ALL
  USING (EXISTS (
    SELECT 1 FROM dashboard_users WHERE id = auth.uid() AND role = 'super-admin'
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM dashboard_users WHERE id = auth.uid() AND role = 'super-admin'
  ));

CREATE POLICY "Admin full access to testimonials"
  ON testimonials FOR ALL
  USING (EXISTS (
    SELECT 1 FROM dashboard_users WHERE id = auth.uid() AND role = 'admin'
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM dashboard_users WHERE id = auth.uid() AND role = 'admin'
  ));


CREATE POLICY "Moderator manage select testimonials"
  ON testimonials FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM dashboard_users WHERE id = auth.uid() AND role = 'moderator'
  ));

CREATE POLICY "Moderator manage insert testimonials"
  ON testimonials FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM dashboard_users WHERE id = auth.uid() AND role = 'moderator'
  ));

CREATE POLICY "Moderator manage update testimonials"
  ON testimonials FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM dashboard_users WHERE id = auth.uid() AND role = 'moderator'
  ));

CREATE POLICY "Moderator manage delete testimonials"
  ON testimonials FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM dashboard_users WHERE id = auth.uid() AND role = 'moderator'
  ));

CREATE POLICY "Viewer read testimonials"
  ON testimonials FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM dashboard_users WHERE id = auth.uid() AND role = 'viewer'
  ));

CREATE POLICY "Allow authenticated user to view own testimonials"
  ON testimonials FOR SELECT
  USING (
    auth.uid() = patient_id
  );

CREATE POLICY "Allow authenticated user to insert own testimonials"
  ON testimonials FOR INSERT
  WITH CHECK (
    auth.uid() = patient_id
  );

CREATE POLICY "Allow authenticated user to delete own testimonials"
  ON testimonials FOR DELETE
  USING (
    auth.uid() = patient_id
  );


CREATE POLICY "Public read testimonials"
  ON testimonials FOR SELECT
  USING (
    is_reviewed = true
  );