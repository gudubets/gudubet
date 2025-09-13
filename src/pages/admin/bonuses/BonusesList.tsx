import { useState } from "react";
import { useAdminBonuses, useDeleteBonus } from "../../../hooks/useBonuses";
import { BONUS_TYPE_LABELS } from "@/lib/types/bonus";
import { Link } from "react-router-dom";
import { Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function BonusesList() {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { toast } = useToast();
  const { data, isLoading, error } = useAdminBonuses();
  const deleteBonus = useDeleteBonus();

  const handleDelete = async (id: string) => {
    if (confirm('Bu bonusu silmek istediğinizden emin misiniz?')) {
      try {
        await deleteBonus.mutateAsync(id);
        toast({
          title: "Başarılı",
          description: "Bonus silindi.",
        });
      } catch (error) {
        toast({
          title: "Hata", 
          description: "Bonus silinirken bir hata oluştu.",
          variant: "destructive"
        });
      }
    }
  };

  if (isLoading) return <div>Loading…</div>;
  if (error) return <div className="text-red-400">Failed to load</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Bonuses</h1>
        <Link to="/admin/bonuses/create" className="rounded bg-cyan-500 px-4 py-2 text-slate-900 hover:bg-cyan-600 transition-colors">
          Create New Bonus
        </Link>
      </div>
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
                  <div className="flex items-center gap-2 justify-end">
                    <Link to={`/admin/bonuses/${b.id}/edit`} className="rounded border border-slate-700 px-3 py-1 hover:bg-slate-900">
                      Edit
                    </Link>
                    <button 
                      onClick={() => handleDelete(b.id)}
                      className="rounded border border-red-600 px-3 py-1 text-red-400 hover:bg-red-600 hover:text-white transition-colors flex items-center gap-1"
                    >
                      <Trash2 className="h-3 w-3" />
                      Sil
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}