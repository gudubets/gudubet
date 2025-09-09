-- Create function to get withdrawal statistics
CREATE OR REPLACE FUNCTION public.get_withdrawal_stats(date_filter DATE)
RETURNS TABLE (
  total_pending INTEGER,
  total_pending_amount NUMERIC,
  total_approved_today INTEGER,
  total_approved_amount_today NUMERIC,
  high_risk_count INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*)::INTEGER FROM public.withdrawals WHERE status = 'pending') as total_pending,
    (SELECT COALESCE(SUM(amount), 0) FROM public.withdrawals WHERE status = 'pending') as total_pending_amount,
    (SELECT COUNT(*)::INTEGER FROM public.withdrawals WHERE status = 'approved' AND DATE(approved_at) = date_filter) as total_approved_today,
    (SELECT COALESCE(SUM(amount), 0) FROM public.withdrawals WHERE status = 'approved' AND DATE(approved_at) = date_filter) as total_approved_amount_today,
    (SELECT COUNT(*)::INTEGER FROM public.withdrawals WHERE risk_score >= 70) as high_risk_count;
END;
$$;