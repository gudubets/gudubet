import { useAdminBonuses } from "../../../hooks/useBonuses";
import { BONUS_TYPE_LABELS } from "@/lib/types/bonus";
import { Link } from "react-router-dom";

export default function BonusesList() {
  const { data, isLoading, error } = useAdminBonuses();
  if (isLoading) return <div>Loading…</div>;
  if (error) return <div className="text-red-400">Failed to load</div>;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Bonuses</h1>
      <div className="overflow-x-auto rounded-xl border border-slate-800">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-900/50">
            <tr>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2">Type</th>
              <th className="px-4 py-2">Amount</th>
              <th className="px-4 py-2">Rollover</th>
              <th className="px-4 py-2">Window</th>
              <th className="px-4 py-2">Active</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {data?.map((b) => (
              <tr key={b.id} className="border-t border-slate-800">
                <td className="px-4 py-2">{b.name}</td>
                <td className="px-4 py-2 text-center">{b.type}</td>
                <td className="px-4 py-2 text-center">
                  {b.amount_type === "percent" ? `${b.amount_value}% (cap ${b.max_cap ?? 0})` : `${b.amount_value}`}
                </td>
                <td className="px-4 py-2 text-center">x{b.rollover_multiplier}</td>
                <td className="px-4 py-2 text-center">{new Date(b.valid_from).toLocaleDateString()} → {new Date(b.valid_to).toLocaleDateString()}</td>
                <td className="px-4 py-2 text-center">{b.is_active ? "✔" : "✖"}</td>
                <td className="px-4 py-2 text-right">
                  <Link to={`/admin/bonuses/${b.id}`} className="rounded border border-slate-700 px-3 py-1 hover:bg-slate-900">Edit</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}