-- Negatif bakiye koruması (Before Insert guard)
create or replace function public.fn_guard_wallet_debit()
returns trigger 
language plpgsql 
security definer
set search_path = public
as $$
declare 
  bal numeric(18,2);
begin
  if NEW.direction = 'debit' then
    select balance into bal from public.wallets where id = NEW.wallet_id for update;
    if bal is null then
      raise exception 'wallet % not found', NEW.wallet_id;
    end if;
    if bal < NEW.amount then
      raise exception 'insufficient funds: balance=%, amount=%', bal, NEW.amount;
    end if;
  end if;
  return NEW;
end $$;

drop trigger if exists trg_guard_wallet_debit on public.wallet_transactions;
create trigger trg_guard_wallet_debit
before insert on public.wallet_transactions
for each row execute function public.fn_guard_wallet_debit();