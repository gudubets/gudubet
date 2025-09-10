-- ENUM'lar (varsa atla)
do $$ begin
  if not exists (select 1 from pg_type where typname='payment_status') then
    create type payment_status as enum ('pending','confirmed','failed');
  end if;
  if not exists (select 1 from pg_type where typname='withdrawal_status') then
    create type withdrawal_status as enum ('pending','approved','rejected','paid');
  end if;
end $$;

-- Payments table idempotency_key ile
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  provider text not null,
  method text not null,
  amount numeric(18,2) not null check (amount >= 0),
  currency text not null default 'TRY',
  status payment_status not null default 'pending',
  provider_ref text,
  idempotency_key text not null,
  meta jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(idempotency_key)
);

-- Eğer payments tablosu zaten varsa ve idempotency_key yoksa ekle
do $$ begin
  if not exists (select 1 from information_schema.columns where table_name='payments' and column_name='idempotency_key') then
    alter table public.payments add column idempotency_key text;
    alter table public.payments add constraint payments_idempotency_key_unique unique(idempotency_key);
    update public.payments set idempotency_key = gen_random_uuid()::text where idempotency_key is null;
    alter table public.payments alter column idempotency_key set not null;
  end if;
end $$;

create index if not exists idx_payments_user_time on public.payments(user_id, created_at desc);

-- Withdrawals table
create table if not exists public.withdrawals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  amount numeric(18,2) not null check (amount >= 0),
  currency text not null default 'TRY',
  status withdrawal_status not null default 'pending',
  reviewer_id uuid,
  note text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_withdrawals_user_status on public.withdrawals(user_id, status, created_at desc);

-- RLS enable
alter table public.payments enable row level security;
alter table public.withdrawals enable row level security;

-- Helper function
create or replace function public.current_user_id() returns uuid 
language sql stable security definer set search_path = public
as $$ select auth.uid() $$;

-- RLS Policies
drop policy if exists "payments self read" on public.payments;
create policy "payments self read"
on public.payments for select 
using (user_id = public.current_user_id());

drop policy if exists "payments service insert" on public.payments;
create policy "payments service insert"
on public.payments for insert 
with check (auth.role() = 'service_role');

drop policy if exists "withdrawals self read" on public.withdrawals;
create policy "withdrawals self read"
on public.withdrawals for select 
using (user_id = public.current_user_id());

drop policy if exists "withdrawals self insert" on public.withdrawals;
create policy "withdrawals self insert"
on public.withdrawals for insert 
with check (user_id = public.current_user_id());