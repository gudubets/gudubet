-- Doğrulama CHECK kısıtları — bonus kuralları
alter table public.bonuses_new
  add constraint if not exists chk_valid_window check (valid_from < valid_to),
  add constraint if not exists chk_rollover_nonneg check (rollover_multiplier >= 0),
  add constraint if not exists chk_amount_value_nonneg check (amount_value >= 0),
  add constraint if not exists chk_max_cap_nonneg check (max_cap >= 0),
  add constraint if not exists chk_min_deposit_nonneg check (min_deposit >= 0);