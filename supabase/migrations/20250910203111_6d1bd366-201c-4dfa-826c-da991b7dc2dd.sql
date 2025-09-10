-- Balance güncelleme trigger'ını AFTER INSERT yap
drop trigger if exists trg_update_wallet_balance on public.wallet_transactions;

create trigger trg_update_wallet_balance
after insert on public.wallet_transactions
for each row execute function public.fn_update_wallet_balance();