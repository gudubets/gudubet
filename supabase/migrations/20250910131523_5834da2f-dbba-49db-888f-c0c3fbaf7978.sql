-- Enhanced withdrawal system with improved audit logging and KYC validation

-- Update withdrawal status enum to include all states
DO $$ 
BEGIN
  -- Check if the type exists before dropping it
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'withdrawal_status') THEN
    DROP TYPE withdrawal_status CASCADE;
  END IF;
END $$;

CREATE TYPE withdrawal_status AS ENUM (
  'pending',
  'reviewing', 
  'approved',
  'rejected',
  'processing',
  'completed',
  'failed'
);

-- Enhanced audit logging trigger for withdrawals
CREATE OR REPLACE FUNCTION log_withdrawal_status_change()
RETURNS TRIGGER AS $$
DECLARE
  client_ip TEXT;
BEGIN
  -- Try to get client IP from current request context
  client_ip := current_setting('request.headers', true)::json->>'cf-connecting-ip';
  IF client_ip IS NULL THEN
    client_ip := current_setting('request.headers', true)::json->>'x-real-ip';
  END IF;
  IF client_ip IS NULL THEN
    client_ip := inet_client_addr()::text;
  END IF;

  -- Log status changes for audit trail
  IF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
    INSERT INTO public.admin_activities (
      admin_id,
      action_type,
      description,
      target_type,
      target_id,
      metadata
    ) VALUES (
      COALESCE(NEW.reviewer_id, auth.uid(), '00000000-0000-0000-0000-000000000000'),
      CASE 
        WHEN NEW.status = 'approved' THEN 'withdrawal_approved'
        WHEN NEW.status = 'rejected' THEN 'withdrawal_rejected'
        WHEN NEW.status = 'processing' THEN 'withdrawal_processing'
        WHEN NEW.status = 'completed' THEN 'withdrawal_completed'
        WHEN NEW.status = 'failed' THEN 'withdrawal_failed'
        ELSE 'withdrawal_status_changed'
      END,
      format('Withdrawal status changed from %s to %s', OLD.status, NEW.status),
      'withdrawal',
      NEW.id,
      jsonb_build_object(
        'old_status', OLD.status,
        'new_status', NEW.status,
        'amount', NEW.amount,
        'currency', NEW.currency,
        'user_id', NEW.user_id,
        'admin_note', NEW.admin_note,
        'rejection_reason', NEW.rejection_reason,
        'ip_address', client_ip,
        'timestamp', now()
      )
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create or replace the trigger
DROP TRIGGER IF EXISTS withdrawal_audit_log_trigger ON public.withdrawals;
CREATE TRIGGER withdrawal_audit_log_trigger
  AFTER UPDATE ON public.withdrawals
  FOR EACH ROW
  EXECUTE FUNCTION log_withdrawal_status_change();

-- Enhanced KYC validation trigger
CREATE OR REPLACE FUNCTION validate_withdrawal_kyc_enhanced()
RETURNS TRIGGER AS $$
DECLARE
  user_kyc_status kyc_level;
  user_kyc_verified boolean;
  kyc_check jsonb;
BEGIN
  -- Get user's KYC status
  SELECT u.kyc_level, u.kyc_status = 'verified' 
  INTO user_kyc_status, user_kyc_verified
  FROM public.users u 
  WHERE u.id = NEW.user_id;
  
  -- Auto-reject if KYC not verified for withdrawals above certain limits
  IF NOT user_kyc_verified OR user_kyc_status = 'level_0' THEN
    -- Allow small withdrawals for level_0 (up to 100 TRY)
    IF NEW.amount > 100 AND user_kyc_status = 'level_0' THEN
      NEW.status := 'rejected';
      NEW.rejection_reason := 'KYC doğrulaması gereklidir. Lütfen kimlik belgelerinizi yükleyiniz.';
      NEW.requires_kyc := true;
      RETURN NEW;
    END IF;
  END IF;
  
  -- Check KYC withdrawal limits
  kyc_check := public.check_kyc_withdrawal_limit(NEW.user_id, NEW.amount);
  
  IF NOT (kyc_check->>'allowed')::boolean THEN
    NEW.status := 'rejected';
    NEW.rejection_reason := CASE 
      WHEN kyc_check->>'reason' = 'daily_limit_exceeded' THEN 'Günlük çekim limitiniz aşıldı. KYC seviyenizi yükseltin.'
      WHEN kyc_check->>'reason' = 'monthly_limit_exceeded' THEN 'Aylık çekim limitiniz aşıldı. KYC seviyenizi yükseltin.'
      WHEN kyc_check->>'reason' = 'yearly_limit_exceeded' THEN 'Yıllık çekim limitiniz aşıldı. KYC seviyenizi yükseltin.'
      ELSE 'KYC limiti aşıldı. Lütfen hesap doğrulamanızı tamamlayın.'
    END;
    NEW.requires_kyc := true;
    NEW.requires_manual_review := true;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update the KYC validation trigger
DROP TRIGGER IF EXISTS validate_withdrawal_kyc_trigger ON public.withdrawals;
CREATE TRIGGER validate_withdrawal_kyc_trigger
  BEFORE INSERT ON public.withdrawals
  FOR EACH ROW
  EXECUTE FUNCTION validate_withdrawal_kyc_enhanced();

-- Create withdrawal state machine validation function
CREATE OR REPLACE FUNCTION validate_withdrawal_status_transition()
RETURNS TRIGGER AS $$
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
        IF NEW.status NOT IN ('processing', 'failed') THEN
          RAISE EXCEPTION 'Invalid status transition from % to %', OLD.status, NEW.status;
        END IF;
      WHEN 'processing' THEN
        IF NEW.status NOT IN ('completed', 'failed') THEN
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

    -- Require admin note for manual status changes
    IF NEW.status IN ('approved', 'rejected') AND OLD.status IN ('pending', 'reviewing') THEN
      IF NEW.admin_note IS NULL OR trim(NEW.admin_note) = '' THEN
        RAISE EXCEPTION 'Admin note is required for approval/rejection';
      END IF;
      IF NEW.reviewer_id IS NULL THEN
        RAISE EXCEPTION 'Reviewer ID is required for approval/rejection';
      END IF;
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
    END CASE;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the state machine validation trigger
DROP TRIGGER IF EXISTS withdrawal_state_machine_trigger ON public.withdrawals;
CREATE TRIGGER withdrawal_state_machine_trigger
  BEFORE UPDATE ON public.withdrawals
  FOR EACH ROW
  EXECUTE FUNCTION validate_withdrawal_status_transition();

-- Enhanced indexes for better performance
CREATE INDEX IF NOT EXISTS idx_withdrawals_status_created_at ON public.withdrawals(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_withdrawals_user_status ON public.withdrawals(user_id, status);
CREATE INDEX IF NOT EXISTS idx_withdrawals_reviewer_id ON public.withdrawals(reviewer_id) WHERE reviewer_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_withdrawals_requires_kyc ON public.withdrawals(requires_kyc) WHERE requires_kyc = true;
CREATE INDEX IF NOT EXISTS idx_withdrawals_risk_score_status ON public.withdrawals(risk_score, status);

-- Create webhook processing log table
CREATE TABLE IF NOT EXISTS public.webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL,
  transaction_id TEXT NOT NULL,
  payload JSONB NOT NULL,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'received',
  error_message TEXT,
  withdrawal_id UUID REFERENCES public.withdrawals(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_webhook_logs_transaction_id ON public.webhook_logs(transaction_id);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_provider ON public.webhook_logs(provider);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_withdrawal_id ON public.webhook_logs(withdrawal_id);