-- Kullanışlı eligibility yardımcı fonksiyonu
create or replace function public.fn_bonus_is_eligible(
  p_user uuid,
  p_bonus uuid,
  p_deposit_amount numeric,
  p_now timestamptz
) returns table(eligible boolean, reason text)
language plpgsql 
security definer
set search_path = public
as $$
declare 
  b record; 
  cnt int; 
  last_evt timestamptz;
begin
  -- Bonus aktif mi ve tarih aralığında mı?
  select * into b from public.bonuses_new
   where id=p_bonus and is_active=true and valid_from<=p_now and valid_to>=p_now;
  if not found then 
    return query select false, 'inactive_or_out_of_window'; 
    return; 
  end if;

  -- Minimum deposit kontrolü
  if p_deposit_amount < b.min_deposit then
    return query select false, 'below_min_deposit'; 
    return;
  end if;

  -- Max per user kontrolü
  select count(*) into cnt
    from public.user_bonus_tracking
   where user_id=p_user and bonus_id=p_bonus
     and status in ('active','completed','forfeited','expired');
  if cnt >= coalesce(b.max_per_user,1) then
    return query select false, 'max_per_user_exceeded'; 
    return;
  end if;

  -- Cooldown kontrolü
  if b.cooldown_hours > 0 then
    select max(created_at) into last_evt
      from public.user_bonus_tracking
     where user_id=p_user and bonus_id=p_bonus;
    if last_evt is not null and last_evt > (p_now - (b.cooldown_hours || ' hours')::interval) then
      return query select false, 'cooldown_active'; 
      return;
    end if;
  end if;

  -- Tüm kontroller geçti
  return query select true, null::text;
end $$;