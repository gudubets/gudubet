-- Raporlama - Günlük KPI view'ları

-- Günlük bonus performans view'ı
create or replace view public.v_bonus_kpis as
select
  date_trunc('day', ub.created_at) as day,
  ub.bonus_id,
  count(*) filter (where ub.status='active')     as active_count,
  count(*) filter (where ub.status='completed')  as completed_count,
  sum(ub.granted_amount)                         as total_granted,
  sum(case when ub.status='completed' then ub.granted_amount else 0 end) as unlocked_amount
from public.user_bonus_tracking ub
group by 1,2;

-- Bonus maliyet analiz view'ı
create or replace view public.v_bonus_costs as
select
  b.id as bonus_id,
  b.name,
  sum(ub.granted_amount)                                                as granted_total,
  sum(case when ub.status='completed' then ub.granted_amount else 0 end) as completed_total,
  sum(case when ub.status='forfeited' then ub.granted_amount else 0 end) as forfeited_total
from public.bonuses_new b
left join public.user_bonus_tracking ub on ub.bonus_id=b.id
group by 1,2;