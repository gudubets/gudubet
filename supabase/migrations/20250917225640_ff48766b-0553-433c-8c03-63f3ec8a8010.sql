-- Fix migration - create tables and policies that don't exist yet
-- Only create tables if they don't exist

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

CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_room_id UUID NOT NULL,
  sender_id UUID NOT NULL,
  sender_name VARCHAR NOT NULL,
  sender_avatar TEXT,
  message TEXT NOT NULL,
  message_type VARCHAR NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'system')),
  is_admin BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add foreign key constraint if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'chat_messages_chat_room_id_fkey' 
    AND table_name = 'chat_messages'
  ) THEN
    ALTER TABLE public.chat_messages 
    ADD CONSTRAINT chat_messages_chat_room_id_fkey 
    FOREIGN KEY (chat_room_id) REFERENCES public.chat_rooms(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Enable RLS if not already enabled
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Create indexes for better performance (IF NOT EXISTS doesn't work with indexes, so use DO block)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_chat_rooms_user_id') THEN 
    CREATE INDEX idx_chat_rooms_user_id ON public.chat_rooms(user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_chat_rooms_admin_id') THEN 
    CREATE INDEX idx_chat_rooms_admin_id ON public.chat_rooms(admin_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_chat_rooms_status') THEN 
    CREATE INDEX idx_chat_rooms_status ON public.chat_rooms(status);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_chat_messages_chat_room_id') THEN 
    CREATE INDEX idx_chat_messages_chat_room_id ON public.chat_messages(chat_room_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_chat_messages_created_at') THEN 
    CREATE INDEX idx_chat_messages_created_at ON public.chat_messages(created_at);
  END IF;
END
$$;

-- Enable realtime for both tables
ALTER TABLE public.chat_rooms REPLICA IDENTITY FULL;
ALTER TABLE public.chat_messages REPLICA IDENTITY FULL;