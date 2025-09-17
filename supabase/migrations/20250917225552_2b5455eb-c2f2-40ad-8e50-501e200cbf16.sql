-- Create chat_rooms table for support tickets
CREATE TABLE IF NOT EXISTS public.chat_rooms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  admin_id UUID REFERENCES public.admins(id),
  subject VARCHAR NOT NULL,
  status VARCHAR NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'active', 'closed')),
  priority VARCHAR NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  unread_count INTEGER NOT NULL DEFAULT 0,
  last_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_room_id UUID NOT NULL REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  sender_name VARCHAR NOT NULL,
  sender_avatar TEXT,
  message TEXT NOT NULL,
  message_type VARCHAR NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'system')),
  is_admin BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Chat rooms policies
CREATE POLICY "Users can view their own chat rooms" 
ON public.chat_rooms 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own chat rooms" 
ON public.chat_rooms 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own chat rooms" 
ON public.chat_rooms 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all chat rooms" 
ON public.chat_rooms 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.admins 
    WHERE admins.id = auth.uid() AND admins.is_active = true
  )
);

CREATE POLICY "Admins can update assigned chat rooms" 
ON public.chat_rooms 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.admins 
    WHERE admins.id = auth.uid() AND admins.is_active = true
  )
);

-- Chat messages policies
CREATE POLICY "Users can view messages in their chat rooms" 
ON public.chat_messages 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.chat_rooms 
    WHERE chat_rooms.id = chat_messages.chat_room_id 
    AND chat_rooms.user_id = auth.uid()
  )
);

CREATE POLICY "Users can send messages in their chat rooms" 
ON public.chat_messages 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.chat_rooms 
    WHERE chat_rooms.id = chat_messages.chat_room_id 
    AND chat_rooms.user_id = auth.uid()
  )
);

CREATE POLICY "Admins can view all chat messages" 
ON public.chat_messages 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.admins 
    WHERE admins.id = auth.uid() AND admins.is_active = true
  )
);

CREATE POLICY "Admins can send messages in any chat room" 
ON public.chat_messages 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.admins 
    WHERE admins.id = auth.uid() AND admins.is_active = true
  )
);

-- Create indexes for better performance
CREATE INDEX idx_chat_rooms_user_id ON public.chat_rooms(user_id);
CREATE INDEX idx_chat_rooms_admin_id ON public.chat_rooms(admin_id);
CREATE INDEX idx_chat_rooms_status ON public.chat_rooms(status);
CREATE INDEX idx_chat_messages_chat_room_id ON public.chat_messages(chat_room_id);
CREATE INDEX idx_chat_messages_created_at ON public.chat_messages(created_at);

-- Create trigger to update updated_at timestamp
CREATE TRIGGER update_chat_rooms_updated_at
  BEFORE UPDATE ON public.chat_rooms
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_update_updated_at_column();

-- Enable realtime for both tables
ALTER TABLE public.chat_rooms REPLICA IDENTITY FULL;
ALTER TABLE public.chat_messages REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;