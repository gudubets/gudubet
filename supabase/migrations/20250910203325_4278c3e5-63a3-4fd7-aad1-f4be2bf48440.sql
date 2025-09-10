-- Doğrulama CHECK kısıtları — bonus kuralları
do $$ 
begin
  -- chk_valid_window
  if not exists (select 1 from information_schema.table_constraints 
                 where constraint_name = 'chk_valid_window' and table_name = 'bonuses_new') then
    alter table public.bonuses_new add constraint chk_valid_window check (valid_from < valid_to);
  end if;
  
  -- chk_rollover_nonneg
  if not exists (select 1 from information_schema.table_constraints 
                 where constraint_name = 'chk_rollover_nonneg' and table_name = 'bonuses_new') then
    alter table public.bonuses_new add constraint chk_rollover_nonneg check (rollover_multiplier >= 0);
  end if;
  
  -- chk_amount_value_nonneg
  if not exists (select 1 from information_schema.table_constraints 
                 where constraint_name = 'chk_amount_value_nonneg' and table_name = 'bonuses_new') then
    alter table public.bonuses_new add constraint chk_amount_value_nonneg check (amount_value >= 0);
  end if;
  
  -- chk_max_cap_nonneg
  if not exists (select 1 from information_schema.table_constraints 
                 where constraint_name = 'chk_max_cap_nonneg' and table_name = 'bonuses_new') then
    alter table public.bonuses_new add constraint chk_max_cap_nonneg check (max_cap >= 0);
  end if;
  
  -- chk_min_deposit_nonneg
  if not exists (select 1 from information_schema.table_constraints 
                 where constraint_name = 'chk_min_deposit_nonneg' and table_name = 'bonuses_new') then
    alter table public.bonuses_new add constraint chk_min_deposit_nonneg check (min_deposit >= 0);
  end if;
end $$;