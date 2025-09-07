-- Enable full replica identity for users table to capture all column changes
ALTER TABLE public.users REPLICA IDENTITY FULL;