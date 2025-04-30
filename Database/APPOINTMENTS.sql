CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE,
  appointment_day DATE NOT NULL,
  appointment_time TIME,
  status TEXT CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')) DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  service_id INT REFERENCES services(id) ON DELETE SET NULL
);


ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super Admin full access to appointments"
  ON appointments FOR ALL
  USING (EXISTS (SELECT 1 FROM dashboard_users WHERE id = auth.uid() AND role = 'super-admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM dashboard_users WHERE id = auth.uid() AND role = 'super-admin'));

CREATE POLICY "Admin manage appointments"
  ON appointments FOR ALL
  USING (EXISTS (SELECT 1 FROM dashboard_users WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM dashboard_users WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Moderator review appointments"
  ON appointments FOR SELECT
  USING (EXISTS (SELECT 1 FROM dashboard_users WHERE id = auth.uid() AND role = 'moderator'));

CREATE POLICY "Moderator manage update appointments"
  ON appointments FOR UPDATE
  USING (EXISTS (SELECT 1 FROM dashboard_users WHERE id = auth.uid() AND role = 'moderator'))
  WITH CHECK (EXISTS (SELECT 1 FROM dashboard_users WHERE id = auth.uid() AND role = 'moderator'));

CREATE POLICY "Moderator manage insert appointments"
  ON appointments FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM dashboard_users WHERE id = auth.uid() AND role = 'moderator'));

CREATE POLICY "Viewer read appointments"
  ON appointments FOR SELECT
  USING (EXISTS (SELECT 1 FROM dashboard_users WHERE id = auth.uid() AND role = 'viewer'));




CREATE POLICY "Patients can view their own appointments"
  ON appointments FOR SELECT
  USING (auth.uid() = patient_id);

CREATE POLICY "Patients can create new appointments"
  ON appointments FOR INSERT
  WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Patients can update their own appointments"
  ON appointments FOR UPDATE
  USING (auth.uid() = patient_id);

CREATE POLICY "Patients can delete their own appointments"
  ON appointments FOR DELETE
  USING (auth.uid() = patient_id);
