-- updated_at dokunuşu trigger'ı
create or replace function public.fn_touch_updated_at()
returns trigger 
language plpgsql 
security definer
set search_path = public
as $$
begin
  NEW.updated_at = now();
  return NEW;
end $$;

-- ihtiyacın olan tablolara ekle
do $$ begin
  if exists (select 1 from information_schema.tables where table_name='bonuses_new') then
    drop trigger if exists trg_touch_bonuses_new on public.bonuses_new;
    create trigger trg_touch_bonuses_new before update on public.bonuses_new
    for each row execute function public.fn_touch_updated_at();
  end if;
  
  if exists (select 1 from information_schema.tables where table_name='user_bonus_tracking') then
    drop trigger if exists trg_touch_user_bonus_tracking on public.user_bonus_tracking;
    create trigger trg_touch_user_bonus_tracking before update on public.user_bonus_tracking
    for each row execute function public.fn_touch_updated_at();
  end if;
  
  if exists (select 1 from information_schema.tables where table_name='wallets') then
    drop trigger if exists trg_touch_wallets on public.wallets;
    create trigger trg_touch_wallets before update on public.wallets
    for each row execute function public.fn_touch_updated_at();
  end if;
end $$;