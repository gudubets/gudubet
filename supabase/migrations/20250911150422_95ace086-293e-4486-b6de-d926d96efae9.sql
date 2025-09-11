-- Add multi-method withdrawals
-- enums
do $$ begin
  if not exists (select 1 from pg_type where typname='withdrawal_method') then
    create type withdrawal_method as enum ('bank','papara','crypto');
  end if;
end $$;

-- columns
alter table public.withdrawals
  add column if not exists method withdrawal_method not null default 'bank',
  add column if not exists payout_details jsonb,
  add column if not exists fee numeric(18,2) not null default 0,
  add column if not exists provider_ref text,
  add column if not exists tx_hash text,
  add column if not exists network text,
  add column if not exists asset text;

-- migrate legacy note -> payout_details when json-like
update public.withdrawals
   set payout_details = coalesce(payout_details, case when note ~ '^{.*}$' then note::jsonb else null end)
 where note is not null and payout_details is null;

-- helpful partial indexes
create index if not exists idx_withdrawals_method on public.withdrawals(method);
create index if not exists idx_withdrawals_status_method on public.withdrawals(status, method);

-- Optional: lightweight validation via trigger
create or replace function public.fn_validate_withdrawal_details()
returns trigger language plpgsql as $$
declare m text; d jsonb; ok boolean := true; err text := '';
begin
  m := coalesce(new.method::text,'bank');
  d := coalesce(new.payout_details,'{}'::jsonb);

  if m = 'bank' then
    if coalesce(d->>'iban','') = '' then ok := false; err := 'iban_required'; end if;
  elsif m = 'papara' then
    if coalesce(d->>'papara_id','') = '' and coalesce(d->>'phone','') = '' then ok := false; err := 'papara_id_or_phone_required'; end if;
  elsif m = 'crypto' then
    if coalesce(d->>'asset','') = '' or coalesce(d->>'network','') = '' or coalesce(d->>'address','') = '' then
      ok := false; err := 'asset_network_address_required';
    end if;
  end if;

  if not ok then
    raise exception 'withdrawal validation failed: %', err using errcode = 'P0001';
  end if;
  return new;
end $$;

drop trigger if exists trg_validate_withdrawal_details on public.withdrawals;
create trigger trg_validate_withdrawal_details
before insert or update on public.withdrawals
for each row execute function public.fn_validate_withdrawal_details();