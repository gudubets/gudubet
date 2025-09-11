-- Sprint 6: Admin Users + Device Tracking + Bonus Rules Editor

-- Add ban field to profiles if it doesn't exist
ALTER TABLE IF EXISTS public.profiles
ADD COLUMN IF NOT EXISTS banned_until timestamptz;

-- User devices table (different from device_fingerprints for specific tracking)
CREATE TABLE IF NOT EXISTS public.user_devices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  device_fp text NOT NULL,
  first_seen_ip inet,
  last_seen_ip inet,
  user_agent text,
  platform text,
  language text,
  timezone text,
  screen text,
  trust_score int NOT NULL DEFAULT 50,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, device_fp)
);

CREATE INDEX IF NOT EXISTS idx_user_devices_user ON public.user_devices(user_id);

-- Device events for tracking user actions
CREATE TABLE IF NOT EXISTS public.device_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  device_fp text NOT NULL,
  ip inet,
  event text NOT NULL,
  meta jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_device_events_user ON public.device_events(user_id, created_at DESC);

-- Trigger for updating updated_at on user_devices
DROP TRIGGER IF EXISTS trg_touch_user_devices ON public.user_devices;
CREATE TRIGGER trg_touch_user_devices 
  BEFORE UPDATE ON public.user_devices
  FOR EACH ROW EXECUTE FUNCTION public.fn_touch_updated_at();

-- RLS policies for user_devices
ALTER TABLE public.user_devices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_devices_self_read" ON public.user_devices;
CREATE POLICY "user_devices_self_read" 
  ON public.user_devices FOR SELECT 
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "user_devices_admin_read" ON public.user_devices;
CREATE POLICY "user_devices_admin_read" 
  ON public.user_devices FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('superadmin', 'finance', 'admin')
    )
  );

DROP POLICY IF EXISTS "user_devices_system_insert" ON public.user_devices;
CREATE POLICY "user_devices_system_insert"
  ON public.user_devices FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "user_devices_system_update" ON public.user_devices;
CREATE POLICY "user_devices_system_update"
  ON public.user_devices FOR UPDATE
  USING (true);

-- RLS policies for device_events  
ALTER TABLE public.device_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "device_events_self_read" ON public.device_events;
CREATE POLICY "device_events_self_read"
  ON public.device_events FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "device_events_admin_read" ON public.device_events;
CREATE POLICY "device_events_admin_read"
  ON public.device_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('superadmin', 'finance', 'admin')
    )
  );

DROP POLICY IF EXISTS "device_events_system_insert" ON public.device_events;
CREATE POLICY "device_events_system_insert"
  ON public.device_events FOR INSERT
  WITH CHECK (true);

-- Admin function to list users from auth.users + profiles
CREATE OR REPLACE FUNCTION public.admin_list_users(
  p_q text DEFAULT NULL,
  p_limit int DEFAULT 100,
  p_offset int DEFAULT 0
)
RETURNS TABLE(id uuid, email text, role text, banned_until timestamptz, last_login_at timestamptz)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check admin permissions
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('superadmin', 'finance', 'admin')
  ) THEN
    RAISE EXCEPTION 'Forbidden: Admin access required';
  END IF;

  RETURN QUERY
    SELECT 
      u.id, 
      u.email::text, 
      COALESCE(p.role, 'user')::text as role, 
      p.banned_until, 
      u.last_sign_in_at
    FROM auth.users u
    LEFT JOIN public.profiles p ON p.id = u.id
    WHERE p_q IS NULL OR u.email ILIKE ('%' || p_q || '%')
    ORDER BY u.created_at DESC
    LIMIT p_limit OFFSET p_offset;
END $$;

-- Admin function to update profile (role/ban)
CREATE OR REPLACE FUNCTION public.admin_update_profile(
  p_user uuid,
  p_role text DEFAULT NULL,
  p_banned_until timestamptz DEFAULT NULL
) 
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check admin permissions
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('superadmin', 'finance', 'admin')
  ) THEN
    RAISE EXCEPTION 'Forbidden: Admin access required';
  END IF;

  -- Ensure profile exists
  INSERT INTO public.profiles (id, role) 
  VALUES (p_user, COALESCE(p_role, 'user'))
  ON CONFLICT (id) DO UPDATE SET
    role = COALESCE(p_role, profiles.role),
    banned_until = p_banned_until;
END $$;

-- Unique index for bonus rules (one rule per bonus)
CREATE UNIQUE INDEX IF NOT EXISTS uq_bonus_rules_bonus 
ON public.bonus_rules(bonus_id);