-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create admins table
CREATE TABLE IF NOT EXISTS public.admins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('super_admin', 'admin', 'support')),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_login_at TIMESTAMPTZ,
  UNIQUE(user_id),
  UNIQUE(email)
);

-- Create admin_actions_log table
CREATE TABLE IF NOT EXISTS public.admin_actions_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  details JSONB,
  ip_address INET, -- Changed from TEXT to INET for IP addresses
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create admin_login_attempts table for rate limiting
CREATE TABLE IF NOT EXISTS public.admin_login_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  ip_address INET NOT NULL, -- Changed from TEXT to INET
  success BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create function to update updated_at
CREATE OR REPLACE FUNCTION update_admin_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_admin_updated_at ON admins;
CREATE TRIGGER update_admin_updated_at
  BEFORE UPDATE ON admins
  FOR EACH ROW
  EXECUTE FUNCTION update_admin_updated_at();

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_admin_actions_log_admin_id ON admin_actions_log(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_log_created_at ON admin_actions_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_login_attempts_email ON admin_login_attempts(email);
CREATE INDEX IF NOT EXISTS idx_admin_login_attempts_ip_address ON admin_login_attempts(ip_address);
CREATE INDEX IF NOT EXISTS idx_admin_login_attempts_created_at ON admin_login_attempts(created_at DESC);

-- Enable RLS
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_actions_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_login_attempts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins are viewable by admins" ON admins;
DROP POLICY IF EXISTS "Admin actions are viewable by admins" ON admin_actions_log;

-- Create policies
CREATE POLICY "Admins are viewable by admins"
  ON admins FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM admins a WHERE a.user_id = auth.uid()
  ));

CREATE POLICY "Admin actions are viewable by admins"
  ON admin_actions_log FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM admins a WHERE a.user_id = auth.uid()
  ));

-- Insert initial super admin (only if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM auth.users WHERE email = 'admin@example.com'
  ) THEN
    INSERT INTO auth.users (email, encrypted_password, email_confirmed_at)
    VALUES ('admin@example.com', crypt('admin123', gen_salt('bf')), NOW());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM admins WHERE email = 'admin@example.com'
  ) THEN
    INSERT INTO admins (user_id, role, name, email)
    SELECT id, 'super_admin', 'Super Admin', 'admin@example.com'
    FROM auth.users
    WHERE email = 'admin@example.com';
  END IF;
END $$;

-- Přidání záznamu do admins tabulky pro existujícího uživatele
INSERT INTO public.admins (
  user_id,
  role,
  name,
  email
)
SELECT 
  id as user_id,
  'super_admin' as role,
  'Filip Dokoupil' as name,
  'dokoupil@passprove.cz' as email
FROM auth.users
WHERE email = 'dokoupil@passprove.cz';

