-- Create the appointments table
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


-- Enable Row Level Security
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Super Admin: Full access (SELECT, INSERT, UPDATE, DELETE)
CREATE POLICY "Super Admin full access to appointments"
  ON appointments FOR ALL
  USING (EXISTS (SELECT 1 FROM dashboard_users WHERE id = auth.uid() AND role = 'super-admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM dashboard_users WHERE id = auth.uid() AND role = 'super-admin'));

-- Admin: Full management of appointments (SELECT, INSERT, UPDATE, DELETE)
CREATE POLICY "Admin manage appointments"
  ON appointments FOR ALL
  USING (EXISTS (SELECT 1 FROM dashboard_users WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM dashboard_users WHERE id = auth.uid() AND role = 'admin'));

-- Moderator: Review and update appointments
CREATE POLICY "Moderator review appointments"
  ON appointments FOR SELECT
  USING (EXISTS (SELECT 1 FROM dashboard_users WHERE id = auth.uid() AND role = 'moderator'));

CREATE POLICY "Moderator manage update appointments"
  ON appointments FOR UPDATE
  USING (EXISTS (SELECT 1 FROM dashboard_users WHERE id = auth.uid() AND role = 'moderator'))
  WITH CHECK (EXISTS (SELECT 1 FROM dashboard_users WHERE id = auth.uid() AND role = 'moderator'));

-- Moderator: Insert new appointments
CREATE POLICY "Moderator manage insert appointments"
  ON appointments FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM dashboard_users WHERE id = auth.uid() AND role = 'moderator'));

-- Viewer: Read-only access to appointments
CREATE POLICY "Viewer read appointments"
  ON appointments FOR SELECT
  USING (EXISTS (SELECT 1 FROM dashboard_users WHERE id = auth.uid() AND role = 'viewer'));




-- المريض: عرض المواعيد الخاصة به
CREATE POLICY "Patients can view their own appointments"
  ON appointments FOR SELECT
  USING (auth.uid() = patient_id);

-- المريض: إنشاء مواعيد جديدة
CREATE POLICY "Patients can create new appointments"
  ON appointments FOR INSERT
  WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Patients can update their own appointments"
  ON appointments FOR UPDATE
  USING (auth.uid() = patient_id);

CREATE POLICY "Patients can delete their own appointments"
  ON appointments FOR DELETE
  USING (auth.uid() = patient_id);
