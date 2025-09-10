import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useBonuses, useCreateBonus, useUpdateBonus } from '@/hooks/useBonuses';
import { BONUS_TYPE_LABELS, type BonusType } from '@/lib/types/bonus';

const bonusSchema = z.object({
  name: z.string().min(1, 'Ad gereklidir'),
  description: z.string().optional(),
  type: z.enum(['FIRST_DEPOSIT', 'RELOAD', 'CASHBACK', 'FREEBET']),
  amount_type: z.enum(['percent', 'fixed']),
  amount_value: z.number().min(0, 'Miktar 0\'dan büyük olmalı'),
  max_cap: z.number().optional(),
  min_deposit: z.number().min(0, 'Minimum yatırım 0\'dan küçük olamaz').default(0),
  rollover_multiplier: z.number().min(0, 'Rollover 0\'dan küçük olamaz').default(0),
  auto_grant: z.boolean().default(false),
  requires_code: z.boolean().default(false),
  code: z.string().optional(),
  valid_from: z.string().optional(),
  valid_to: z.string().optional(),
  max_per_user: z.number().min(1, 'Kullanıcı başına minimum 1').default(1),
  cooldown_hours: z.number().min(0, 'Cooldown 0\'dan küçük olamaz').default(0),
  is_active: z.boolean().default(true)
});

type BonusFormData = z.infer<typeof bonusSchema>;

export default function BonusForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const { data: bonuses } = useBonuses();
  const createBonus = useCreateBonus();
  const updateBonus = useUpdateBonus();

  const currentBonus = isEdit ? bonuses?.find(b => b.id === id) : null;

  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm<BonusFormData>({
    resolver: zodResolver(bonusSchema),
    defaultValues: {
      auto_grant: false,
      requires_code: false,
      is_active: true,
      rollover_multiplier: 0,
      max_per_user: 1,
      cooldown_hours: 0
    }
  });

  const requiresCode = watch('requires_code');

  useEffect(() => {
    if (currentBonus) {
      reset({
        name: currentBonus.name,
        description: currentBonus.description || '',
        type: currentBonus.type,
        amount_type: currentBonus.amount_type,
        amount_value: currentBonus.amount_value,
        max_cap: currentBonus.max_cap || undefined,
        min_deposit: currentBonus.min_deposit || undefined,
        rollover_multiplier: currentBonus.rollover_multiplier || 0,
        auto_grant: currentBonus.auto_grant,
        requires_code: currentBonus.requires_code,
        code: currentBonus.code || '',
        valid_from: currentBonus.valid_from ? new Date(currentBonus.valid_from).toISOString().slice(0, 16) : '',
        valid_to: currentBonus.valid_to ? new Date(currentBonus.valid_to).toISOString().slice(0, 16) : '',
        max_per_user: currentBonus.max_per_user || 1,
        cooldown_hours: currentBonus.cooldown_hours || 0,
        is_active: currentBonus.is_active
      });
    }
  }, [currentBonus, reset]);

  const onSubmit = async (data: BonusFormData) => {
    try {
      // Ensure all required fields are present
      const bonusData: BonusFormData = {
        name: data.name,
        type: data.type,
        amount_type: data.amount_type, 
        amount_value: data.amount_value,
        rollover_multiplier: data.rollover_multiplier,
        auto_grant: data.auto_grant,
        requires_code: data.requires_code,
        is_active: data.is_active,
        min_deposit: data.min_deposit || 0,
        max_per_user: data.max_per_user || 1,
        cooldown_hours: data.cooldown_hours || 0,
        ...data
      };

      if (isEdit && id) {
        await updateBonus.mutateAsync({ id, data: data as any });
      } else {
        await createBonus.mutateAsync(data as any);
      }
      navigate('/admin/bonuses');
    } catch (error) {
      alert('İşlem başarısız: ' + (error as Error).message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">
          {isEdit ? 'Bonus Düzenle' : 'Yeni Bonus Oluştur'}
        </h1>
        <button
          onClick={() => navigate('/admin/bonuses')}
          className="text-gray-400 hover:text-white"
        >
          Geri Dön
        </button>
      </div>

      <div className="bg-gray-800 rounded-lg p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Bonus Adı *
              </label>
              <input
                {...register('name')}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Bonus Türü *
              </label>
              <select
                {...register('type')}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.entries(BONUS_TYPE_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Miktar Türü *
              </label>
              <select
                {...register('amount_type')}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="percent">Yüzde</option>
                <option value="fixed">Sabit</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Miktar Değeri *
              </label>
              <input
                {...register('amount_value', { valueAsNumber: true })}
                type="number"
                step="0.01"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.amount_value && <p className="text-red-400 text-sm mt-1">{errors.amount_value.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Maksimum Limit
              </label>
              <input
                {...register('max_cap', { valueAsNumber: true })}
                type="number"
                step="0.01"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Minimum Yatırım
              </label>
              <input
                {...register('min_deposit', { valueAsNumber: true })}
                type="number"
                step="0.01"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Rollover Çarpanı *
              </label>
              <input
                {...register('rollover_multiplier', { valueAsNumber: true })}
                type="number"
                step="0.1"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.rollover_multiplier && <p className="text-red-400 text-sm mt-1">{errors.rollover_multiplier.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Kullanıcı Başına Maksimum *
              </label>
              <input
                {...register('max_per_user', { valueAsNumber: true })}
                type="number"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.max_per_user && <p className="text-red-400 text-sm mt-1">{errors.max_per_user.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Cooldown (Saat) *
              </label>
              <input
                {...register('cooldown_hours', { valueAsNumber: true })}
                type="number"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.cooldown_hours && <p className="text-red-400 text-sm mt-1">{errors.cooldown_hours.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Başlangıç Tarihi
              </label>
              <input
                {...register('valid_from')}
                type="datetime-local"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Bitiş Tarihi
              </label>
              <input
                {...register('valid_to')}
                type="datetime-local"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {requiresCode && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Bonus Kodu
                </label>
                <input
                  {...register('code')}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Açıklama
            </label>
            <textarea
              {...register('description')}
              rows={3}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-4">
            <label className="flex items-center">
              <input
                {...register('auto_grant')}
                type="checkbox"
                className="rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-300">Otomatik Ver</span>
            </label>

            <label className="flex items-center">
              <input
                {...register('requires_code')}
                type="checkbox"
                className="rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-300">Kod Gerektirir</span>
            </label>

            <label className="flex items-center">
              <input
                {...register('is_active')}
                type="checkbox"
                className="rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-300">Aktif</span>
            </label>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/admin/bonuses')}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={createBonus.isPending || updateBonus.isPending}
              className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg text-white font-medium transition-colors disabled:opacity-50"
            >
              {createBonus.isPending || updateBonus.isPending ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}