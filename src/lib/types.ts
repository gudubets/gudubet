export type BonusType = 'FIRST_DEPOSIT' | 'RELOAD' | 'CASHBACK' | 'FREEBET';
export type BonusStatus = 'eligible' | 'active' | 'completed' | 'forfeited' | 'expired';
export type WalletType = 'main' | 'bonus';

export interface Bonus {
  id: string;
  code?: string;
  type: BonusType;
  name: string;
  description?: string;
  amount_type: 'percent' | 'fixed';
  amount_value: number;
  max_cap?: number;
  min_deposit?: number;
  rollover_multiplier?: number;
  auto_grant: boolean;
  requires_code: boolean;
  valid_from?: string;
  valid_to?: string;
  max_per_user?: number;
  cooldown_hours?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserBonusTracking {
  id: string;
  user_id: string;
  bonus_id: string;
  status: BonusStatus;
  granted_amount: number;
  remaining_rollover: number;
  progress: number;
  currency: string;
  expires_at?: string;
  created_at: string;
  updated_at: string;
  bonuses_new?: Bonus;
}

export interface BonusEvent {
  id: string;
  user_id: string;
  user_bonus_id?: string;
  type: string;
  payload: Record<string, any>;
  occurred_at: string;
}

export interface ClaimBonusRequest {
  bonus_id: string;
  deposit_amount?: number;
  code?: string;
}

export interface ClaimBonusResponse {
  ok: boolean;
  user_bonus_id: string;
  granted: number;
  error?: string;
}

export const BONUS_TYPE_LABELS: Record<BonusType, string> = {
  FIRST_DEPOSIT: 'İlk Yatırım Bonusu',
  RELOAD: 'Yeniden Yükle Bonusu',
  CASHBACK: 'Kayıp Bonusu',
  FREEBET: 'Bedava Bahis'
};

export const BONUS_STATUS_LABELS: Record<BonusStatus, string> = {
  eligible: 'Uygun',
  active: 'Aktif',
  completed: 'Tamamlandı',
  forfeited: 'İptal Edildi',
  expired: 'Süresi Doldu'
};