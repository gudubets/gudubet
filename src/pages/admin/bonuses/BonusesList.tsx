import React from 'react';
import { Link } from 'react-router-dom';
import { useBonuses, useDeleteBonus } from '@/hooks/useBonuses';
import { BONUS_TYPE_LABELS } from '@/lib/types';

export default function BonusesList() {
  const { data: bonuses, isLoading } = useBonuses();
  const deleteBonus = useDeleteBonus();

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`"${name}" bonusunu silmek istediğinize emin misiniz?`)) {
      try {
        await deleteBonus.mutateAsync(id);
      } catch (error) {
        alert('Silme işlemi başarısız: ' + (error as Error).message);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl text-gray-400">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Bonus Yönetimi</h1>
        <Link 
          to="/admin/bonuses/create"
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-white font-medium transition-colors"
        >
          Yeni Bonus Oluştur
        </Link>
      </div>

      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Ad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Tür
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Miktar
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Rollover
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Geçerlilik
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Durum
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-700">
              {bonuses?.map((bonus) => (
                <tr key={bonus.id} className="hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                    {bonus.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {BONUS_TYPE_LABELS[bonus.type]}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {bonus.amount_type === 'percent' 
                      ? `%${bonus.amount_value}` 
                      : `${bonus.amount_value} TL`}
                    {bonus.max_cap && ` (Max: ${bonus.max_cap} TL)`}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {bonus.rollover_multiplier}x
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {bonus.valid_from && new Date(bonus.valid_from).toLocaleDateString('tr-TR')} - {' '}
                    {bonus.valid_to && new Date(bonus.valid_to).toLocaleDateString('tr-TR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      bonus.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {bonus.is_active ? 'Aktif' : 'Pasif'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <Link 
                      to={`/admin/bonuses/${bonus.id}/edit`}
                      className="text-blue-400 hover:text-blue-300"
                    >
                      Düzenle
                    </Link>
                    <button
                      onClick={() => handleDelete(bonus.id, bonus.name)}
                      className="text-red-400 hover:text-red-300"
                      disabled={deleteBonus.isPending}
                    >
                      Sil
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {bonuses?.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-xl mb-4">Henüz bonus yok</div>
          <Link 
            to="/admin/bonuses/create"
            className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg text-white font-medium transition-colors"
          >
            İlk Bonusu Oluştur
          </Link>
        </div>
      )}
    </div>
  );
}