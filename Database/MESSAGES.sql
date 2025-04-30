CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  guest_ip TEXT,
  guest_name TEXT,
  guest_email TEXT,
  subject TEXT,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

CREATE TABLE guest_message_limits (
  guest_ip TEXT PRIMARY KEY,
  last_message_time TIMESTAMP WITH TIME ZONE,
  current_cooldown_hours INT DEFAULT 1,
  message_count INT DEFAULT 0
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE guest_message_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super Admin full access to messages"
  ON messages FOR ALL
  USING (EXISTS (
    SELECT 1 FROM dashboard_users WHERE id = auth.uid() AND role = 'super-admin'
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM dashboard_users WHERE id = auth.uid() AND role = 'super-admin'
  ));

CREATE POLICY "Admin full access to messages"
  ON messages FOR ALL
  USING (EXISTS (
    SELECT 1 FROM dashboard_users WHERE id = auth.uid() AND role = 'admin'
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM dashboard_users WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Moderator manage select messages"
  ON messages FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM dashboard_users WHERE id = auth.uid() AND role = 'moderator'
  ));

CREATE POLICY "Moderator manage insert messages"
  ON messages FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM dashboard_users WHERE id = auth.uid() AND role = 'moderator'
  ));

CREATE POLICY "Moderator manage update messages"
  ON messages FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM dashboard_users WHERE id = auth.uid() AND role = 'moderator'
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM dashboard_users WHERE id = auth.uid() AND role = 'moderator'
  ));

CREATE POLICY "Moderator manage delete messages"
  ON messages FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM dashboard_users WHERE id = auth.uid() AND role = 'moderator'
  ));

CREATE POLICY "Viewer read messages"
  ON messages FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM dashboard_users WHERE id = auth.uid() AND role = 'viewer'
  ));

CREATE POLICY "Allow authenticated user to view own messages"
  ON messages FOR SELECT
  USING (
    auth.uid() = patient_id
  );

CREATE POLICY "Allow authenticated user to insert own messages"
  ON messages FOR INSERT
  WITH CHECK (
    auth.uid() = patient_id
  );

CREATE POLICY "Allow authenticated user to delete own messages"
  ON messages FOR DELETE
  USING (
    auth.uid() = patient_id
  );

CREATE POLICY allow_public_insert
  ON messages
  FOR INSERT
  TO public
  WITH CHECK (true);


CREATE POLICY "allow_public_full_access"
  ON guest_message_limits
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

CREATE FUNCTION check_guest_message_limit(p_guest_ip TEXT)
RETURNS TABLE (can_send BOOLEAN, wait_time JSONB) 
LANGUAGE plpgsql
AS $$
DECLARE
  last_msg_time TIMESTAMP WITH TIME ZONE;
  cooldown_hours INT;
  msg_count INT;
  remaining_time INTERVAL;
BEGIN
  INSERT INTO guest_message_limits (guest_ip, last_message_time, current_cooldown_hours, message_count)
  VALUES (p_guest_ip, NULL, 1, 0)
  ON CONFLICT (guest_ip) DO NOTHING;

  SELECT last_message_time, current_cooldown_hours, message_count
  INTO last_msg_time, cooldown_hours, msg_count
  FROM guest_message_limits
  WHERE guest_ip = p_guest_ip;

  IF last_msg_time IS NULL OR 
    (CURRENT_TIMESTAMP - last_msg_time) > INTERVAL '24 hours' THEN
    
    UPDATE guest_message_limits 
    SET current_cooldown_hours = 1,
        message_count = 0,
        last_message_time = CURRENT_TIMESTAMP
    WHERE guest_ip = p_guest_ip;
    
    RETURN QUERY SELECT 
      true::BOOLEAN,
      jsonb_build_object('hours', 0, 'minutes', 0)::JSONB;
  ELSE
    remaining_time := (last_msg_time + (cooldown_hours * INTERVAL '1 hour')) - CURRENT_TIMESTAMP;
    
    IF remaining_time <= INTERVAL '0' THEN
      UPDATE guest_message_limits 
      SET current_cooldown_hours = LEAST(cooldown_hours * 2, 24),
          last_message_time = CURRENT_TIMESTAMP,
          message_count = message_count + 1
      WHERE guest_ip = p_guest_ip;
      
      RETURN QUERY SELECT 
        true::BOOLEAN,
        jsonb_build_object('hours', 0, 'minutes', 0)::JSONB;
    ELSE
      RETURN QUERY SELECT 
        false::BOOLEAN,
        jsonb_build_object(
          'hours', EXTRACT(HOUR FROM remaining_time)::INT,
          'minutes', EXTRACT(MINUTE FROM remaining_time)::INT
        )::JSONB;
    END IF;
  END IF;
END;
$$;
