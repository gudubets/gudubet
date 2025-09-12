-- Fix the withdrawal validation trigger to not require reviewer_id for admin notes in certain cases
CREATE OR REPLACE FUNCTION public.validate_withdrawal_status_transition()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  -- Define valid status transitions
  IF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
    -- Validate state transitions
    CASE OLD.status
      WHEN 'pending' THEN
        IF NEW.status NOT IN ('reviewing', 'approved', 'rejected') THEN
          RAISE EXCEPTION 'Invalid status transition from % to %', OLD.status, NEW.status;
        END IF;
      WHEN 'reviewing' THEN
        IF NEW.status NOT IN ('approved', 'rejected', 'pending') THEN
          RAISE EXCEPTION 'Invalid status transition from % to %', OLD.status, NEW.status;
        END IF;
      WHEN 'approved' THEN
        IF NEW.status NOT IN ('processing', 'failed', 'paid') THEN
          RAISE EXCEPTION 'Invalid status transition from % to %', OLD.status, NEW.status;
        END IF;
      WHEN 'processing' THEN
        IF NEW.status NOT IN ('completed', 'failed', 'paid') THEN
          RAISE EXCEPTION 'Invalid status transition from % to %', OLD.status, NEW.status;
        END IF;
      WHEN 'completed', 'rejected', 'failed' THEN
        -- Terminal states - no transitions allowed except by system admin
        IF NEW.status != OLD.status AND NOT EXISTS (
          SELECT 1 FROM public.admins WHERE id = auth.uid() AND role_type = 'super_admin'
        ) THEN
          RAISE EXCEPTION 'Cannot change status from terminal state %', OLD.status;
        END IF;
    END CASE;

    -- Require admin note for manual status changes (but be more flexible about reviewer_id)
    IF NEW.status IN ('approved', 'rejected') AND OLD.status IN ('pending', 'reviewing') THEN
      -- Only require admin_note for rejections
      IF NEW.status = 'rejected' AND (NEW.admin_note IS NULL OR trim(NEW.admin_note) = '') THEN
        RAISE EXCEPTION 'Admin note is required for rejection';
      END IF;
      
      -- Reviewer ID is set by the edge function, don't validate it here since it causes conflicts
      -- The edge function handles setting reviewer_id properly
    END IF;

    -- Set timestamps automatically
    CASE NEW.status
      WHEN 'approved' THEN
        NEW.approved_at := COALESCE(NEW.approved_at, now());
        NEW.reviewed_at := COALESCE(NEW.reviewed_at, now());
      WHEN 'rejected' THEN
        NEW.reviewed_at := COALESCE(NEW.reviewed_at, now());
      WHEN 'processing' THEN
        NEW.processed_at := COALESCE(NEW.processed_at, now());
      WHEN 'completed' THEN
        NEW.completed_at := COALESCE(NEW.completed_at, now());
      WHEN 'paid' THEN
        NEW.completed_at := COALESCE(NEW.completed_at, now());
    END CASE;
  END IF;

  RETURN NEW;
END;
$function$;