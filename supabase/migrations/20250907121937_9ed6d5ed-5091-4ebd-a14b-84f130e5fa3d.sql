-- Enable realtime for users table to sync balance updates
ALTER TABLE public.users REPLICA IDENTITY FULL;

-- Add users table to realtime publication (if not already added)
-- This will allow real-time balance updates across all connected clients
DO $$
BEGIN
  -- Check if the table is already in the publication
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'users'
  ) THEN
    -- Add the table to the realtime publication
    ALTER PUBLICATION supabase_realtime ADD TABLE public.users;
  END IF;
END $$;