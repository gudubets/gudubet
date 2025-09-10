-- Tekil cüzdan tablosu
do $$ begin
  if not exists (select 1 from pg_type where typname='wallet_type') then
    create type wallet_type as enum ('main','bonus');
  end if;
end $$;

create table if not exists public.wallets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type wallet_type not null,
  balance numeric(18,2) not null default 0,
  currency text not null default 'TRY',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, type, currency)
);

-- bonus_wallets → wallets'e taşı (kolon adlarını kendi şemana göre eşle)
insert into public.wallets (id, user_id, type, balance, currency, created_at, updated_at)
select id, user_id, 'bonus'::wallet_type, balance, currency, created_at, updated_at
from public.bonus_wallets
on conflict (id) do nothing;

-- FK'yi wallets'e çevir
alter table public.wallet_transactions
  drop constraint if exists wallet_transactions_wallet_id_fkey,
  add constraint wallet_transactions_wallet_id_fkey
  foreign key (wallet_id) references public.wallets(id) on delete cascade;

-- RLS policies for wallets
alter table public.wallets enable row level security;

drop policy if exists "users_view_own_wallets" on public.wallets;
create policy "users_view_own_wallets"
on public.wallets for select 
using (user_id = public.current_user_id());

drop policy if exists "admin_manage_wallets" on public.wallets;
create policy "admin_manage_wallets"
on public.wallets for all 
using (EXISTS (
  SELECT 1 FROM admins 
  WHERE id = auth.uid() AND is_active = true
));

drop policy if exists "system_manage_wallets" on public.wallets;
create policy "system_manage_wallets"
on public.wallets for all 
using (auth.role() = 'service_role');

-- Update wallet balance trigger to work with unified wallets table
create or replace function public.fn_update_wallet_balance()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (TG_OP = 'INSERT') then
    if NEW.direction = 'credit' then
      -- Update wallets table
      update public.wallets 
      set balance = balance + NEW.amount, updated_at = now()
      where id = NEW.wallet_id;
    else
      -- Update wallets table  
      update public.wallets 
      set balance = balance - NEW.amount, updated_at = now()
      where id = NEW.wallet_id;
    end if;
  end if;
  return NEW;
end; 
$$;