-- Edge fonksiyonu için bonus onaylandığında bonusu kullanıcıya veren fonksiyon
CREATE OR REPLACE FUNCTION public.grant_bonus_to_user(
  p_user_id uuid,
  p_bonus_id uuid,
  p_deposit_amount numeric DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  bonus_data record;
  granted_amount numeric;
  rollover_target numeric;
  user_bonus_id uuid;
  bonus_wallet_id uuid;
  result jsonb;
BEGIN
  -- Bonus bilgilerini al
  SELECT * INTO bonus_data
  FROM bonuses_new 
  WHERE id = p_bonus_id AND is_active = true;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Bonus bulunamadı veya aktif değil');
  END IF;
  
  -- Granted amount hesapla
  IF bonus_data.amount_type = 'percent' THEN
    IF p_deposit_amount IS NULL OR p_deposit_amount <= 0 THEN
      RETURN jsonb_build_object('error', 'Yüzde bonusu için yatırım miktarı gerekli');
    END IF;
    granted_amount := (p_deposit_amount * bonus_data.amount_value) / 100;
    IF bonus_data.max_cap IS NOT NULL THEN
      granted_amount := LEAST(granted_amount, bonus_data.max_cap);
    END IF;
  ELSE
    granted_amount := bonus_data.amount_value;
    IF bonus_data.max_cap IS NOT NULL THEN
      granted_amount := LEAST(granted_amount, bonus_data.max_cap);
    END IF;
  END IF;
  
  -- Minimum deposit kontrolü
  IF bonus_data.min_deposit > 0 AND (p_deposit_amount IS NULL OR p_deposit_amount < bonus_data.min_deposit) THEN
    RETURN jsonb_build_object('error', 'Minimum yatırım miktarı: ' || bonus_data.min_deposit || ' TL');
  END IF;
  
  rollover_target := granted_amount * COALESCE(bonus_data.rollover_multiplier, 0);
  
  -- User bonus tracking kaydı oluştur
  INSERT INTO user_bonus_tracking (
    user_id,
    bonus_id,
    status,
    granted_amount,
    remaining_rollover,
    progress,
    currency,
    expires_at,
    last_event_at
  ) VALUES (
    p_user_id,
    p_bonus_id,
    'active',
    granted_amount,
    rollover_target,
    0,
    COALESCE(bonus_data.currency, 'TRY'),
    bonus_data.valid_to,
    now()
  ) RETURNING id INTO user_bonus_id;
  
  -- Bonus cüzdanını bul veya oluştur
  SELECT id INTO bonus_wallet_id
  FROM wallets 
  WHERE user_id = p_user_id AND type = 'bonus'
  LIMIT 1;
  
  IF bonus_wallet_id IS NULL THEN
    INSERT INTO wallets (user_id, type, currency, balance)
    VALUES (p_user_id, 'bonus', COALESCE(bonus_data.currency, 'TRY'), 0)
    RETURNING id INTO bonus_wallet_id;
  END IF;
  
  -- Wallet'a para yatır
  IF granted_amount > 0 THEN
    INSERT INTO wallet_transactions (
      wallet_id,
      direction,
      amount,
      ref_type,
      ref_id,
      ledger_key,
      meta
    ) VALUES (
      bonus_wallet_id,
      'credit',
      granted_amount,
      'bonus_grant',
      user_bonus_id,
      'BONUS_GRANT',
      jsonb_build_object('bonus_id', p_bonus_id)
    );
  END IF;
  
  -- Bonus event oluştur
  INSERT INTO bonus_events (
    user_id,
    user_bonus_id,
    type,
    payload
  ) VALUES (
    p_user_id,
    user_bonus_id,
    'bonus_granted',
    jsonb_build_object(
      'origin', 'admin_approval',
      'granted', granted_amount,
      'bonus_id', p_bonus_id
    )
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'user_bonus_id', user_bonus_id,
    'granted_amount', granted_amount,
    'rollover_target', rollover_target
  );
END;
$$;