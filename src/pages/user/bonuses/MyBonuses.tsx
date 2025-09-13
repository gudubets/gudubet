import { useMyBonuses, useClaimBonus } from "../../../hooks/useBonuses";
import { useState } from "react";

export default function MyBonuses() {
  const { data: active } = useMyBonuses("active");
  const { data: eligible } = useMyBonuses("eligible");
  const claimM = useClaimBonus();

  const [depositAmount, setDepositAmount] = useState<number>(0);
  const [code, setCode] = useState<string>("");

  return (
    <div className="space-y-8">
      <section>
        <h2 className="mb-2 text-lg font-semibold">Eligible</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {(eligible ?? []).map((ub) => (
            <div key={ub.id} className="rounded-xl border border-slate-800 p-4">
              <div className="text-sm opacity-80">Bonus ID: {ub.bonus_id}</div>
              <div className="mt-2 flex items-center gap-2">
                <input type="number" placeholder="Deposit amount" value={depositAmount}
                  onChange={(e)=>setDepositAmount(parseFloat(e.target.value))}
                  className="w-40 rounded bg-slate-900 p-2" />
                <input type="text" placeholder="Code (optional)" value={code}
                  onChange={(e)=>setCode(e.target.value)}
                  className="w-40 rounded bg-slate-900 p-2" />
                <button
                  onClick={() => claimM.mutate({ bonus_id: ub.bonus_id, deposit_amount: depositAmount || undefined, code: code || undefined })}
                  className="rounded bg-cyan-500 px-3 py-2 text-slate-900">
                  Talep Et
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold">Active</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {(active ?? []).map((ub) => (
            <div key={ub.id} className="rounded-xl border border-slate-800 p-4">
              <div>Granted: {ub.granted_amount}</div>
              <div>Progress: {ub.progress} / Remaining: {ub.remaining_rollover}</div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded bg-slate-800">
                <div className="h-full bg-cyan-500" style={{ width: `${(ub.progress/(ub.progress+ub.remaining_rollover))*100 || 0}%` }} />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}