-- Kısmi benzersizlik — aynı bonus için aynı kullanıcıda en fazla bir eligible/active
create unique index if not exists uq_user_bonus_one_active_or_eligible
on public.user_bonus_tracking(user_id, bonus_id)
where status in ('eligible','active');