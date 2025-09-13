-- Add new event type for loss bonus tracking
DO $$ 
BEGIN
  -- Try to add the new enum value
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'loss_bonus_claimed' 
    AND enumtypid = (
      SELECT oid FROM pg_type WHERE typname = 'bonus_event_type'
    )
  ) THEN
    ALTER TYPE bonus_event_type ADD VALUE 'loss_bonus_claimed';
  END IF;
END $$;