-- Create notifications table for admin to user communications
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'warning', 'success', 'error')),
  target_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- null means for all users
  admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_read BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_notifications junction table to track individual user notification status
CREATE TABLE public.user_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  notification_id UUID NOT NULL REFERENCES public.notifications(id) ON DELETE CASCADE,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, notification_id)
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notifications
CREATE POLICY "Users can view active notifications for them or global"
  ON public.notifications FOR SELECT
  USING (
    is_active = true 
    AND (expires_at IS NULL OR expires_at > NOW())
    AND (target_user_id IS NULL OR target_user_id = auth.uid())
  );

CREATE POLICY "Admins can manage notifications" 
  ON public.notifications FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.admins 
      WHERE id = auth.uid() AND role_type IN ('super_admin', 'admin')
    )
  );

-- RLS Policies for user_notifications  
CREATE POLICY "Users can view their notification status"
  ON public.user_notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their notification status"
  ON public.user_notifications FOR UPDATE  
  USING (user_id = auth.uid());

CREATE POLICY "System can insert user notification status"
  ON public.user_notifications FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Create function to automatically create user_notifications when notification is created
CREATE OR REPLACE FUNCTION create_user_notifications()
RETURNS TRIGGER AS $$
BEGIN
  -- If notification is for a specific user
  IF NEW.target_user_id IS NOT NULL THEN
    INSERT INTO public.user_notifications (user_id, notification_id)
    VALUES (NEW.target_user_id, NEW.id);
  ELSE
    -- If notification is for all users, create records for all existing users
    INSERT INTO public.user_notifications (user_id, notification_id)
    SELECT au.id, NEW.id 
    FROM auth.users au
    WHERE au.email_confirmed_at IS NOT NULL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
CREATE TRIGGER trigger_create_user_notifications
  AFTER INSERT ON public.notifications
  FOR EACH ROW EXECUTE FUNCTION create_user_notifications();

-- Create indexes for performance
CREATE INDEX idx_notifications_target_user ON public.notifications(target_user_id);
CREATE INDEX idx_notifications_active ON public.notifications(is_active, expires_at);
CREATE INDEX idx_user_notifications_user_read ON public.user_notifications(user_id, is_read);

-- Enable realtime
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
ALTER TABLE public.user_notifications REPLICA IDENTITY FULL;

-- Add to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_notifications;