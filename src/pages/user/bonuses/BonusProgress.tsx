import { useMyBonuses } from "../../../hooks/useBonuses";

export default function BonusProgress() {
  const { data } = useMyBonuses("active");
  if (!data?.length) return <div>No active bonus</div>;
  const ub = data[0];
  const pct = (ub.progress / (ub.progress + ub.remaining_rollover)) * 100 || 0;

  return (
    <div className="max-w-xl space-y-4">
      <h1 className="text-xl font-semibold">Current Bonus Progress</h1>
      <div className="rounded-xl border border-slate-800 p-4">
        <div className="text-sm opacity-80">Bonus ID: {ub.bonus_id}</div>
        <div className="mt-2">Granted: {ub.granted_amount}</div>
        <div className="">Remaining Rollover: {ub.remaining_rollover.toFixed(2)}</div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded bg-slate-800">
          <div className="h-full bg-cyan-500" style={{ width: `${pct}%` }} />
        </div>
        <div className="mt-2 text-sm opacity-80">{pct.toFixed(1)}%</div>
      </div>
    </div>
  );
}