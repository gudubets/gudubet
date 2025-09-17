-- Add foreign key relationship between chat_rooms and profiles
-- First, let's add the missing foreign key constraint
ALTER TABLE public.chat_rooms 
ADD CONSTRAINT chat_rooms_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users (id) ON DELETE CASCADE;

-- Also add foreign key for admin_id to profiles if it doesn't exist
ALTER TABLE public.chat_rooms 
ADD CONSTRAINT chat_rooms_admin_id_fkey 
FOREIGN KEY (admin_id) REFERENCES auth.users (id) ON DELETE SET NULL;