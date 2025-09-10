-- Add idempotency_key column to payment_webhooks table for webhook deduplication
ALTER TABLE public.payment_webhooks 
ADD COLUMN IF NOT EXISTS idempotency_key TEXT UNIQUE;

-- Create index for better performance on idempotency checks
CREATE INDEX IF NOT EXISTS idx_payment_webhooks_idempotency_key 
ON public.payment_webhooks(idempotency_key);

-- Create index for better performance on processed status
CREATE INDEX IF NOT EXISTS idx_payment_webhooks_processed 
ON public.payment_webhooks(processed);

-- Add comment to explain the idempotency key
COMMENT ON COLUMN public.payment_webhooks.idempotency_key IS 'HMAC-SHA256 hash used for webhook deduplication to prevent duplicate processing';