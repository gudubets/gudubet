// Bonus sistem tip tanımlamaları

export type BonusType = 'FIRST_DEPOSIT' | 'RELOAD' | 'CASHBACK' | 'FREEBET';
export type BonusStatus = 'eligible' | 'active' | 'completed' | 'forfeited' | 'expired';
export type WalletType = 'main' | 'bonus';
export type TransactionDirection = 'debit' | 'credit';
export type BonusEventType = 
  | 'deposit_made' 
  | 'wager_placed' 
  | 'wager_voided' 
  | 'bonus_granted' 
  | 'bonus_progressed' 
  | 'bonus_completed' 
  | 'bonus_forfeited' 
  | 'bonus_expired' 
  | 'manual_review_triggered';

export interface Bonus {
  id: string;
  code?: string;
  type: BonusType;
  name: string;
  description?: string;
  amount_type: 'percent' | 'fixed';
  amount_value: number;
  max_cap?: number;
  min_deposit: number;
  rollover_multiplier: number;
  auto_grant: boolean;
  requires_code: boolean;
  valid_from?: string;
  valid_to?: string;
  max_per_user: number;
  cooldown_hours: number;
  is_active: boolean;
  excluded_providers?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface BonusRule {
  id: string;
  bonus_id: string;
  rules: {
    category_weights?: Record<string, number>;
    eligible_games?: string[];
    blacklist_games?: string[];
  };
  created_at: string;
  updated_at: string;
}

export interface UserBonus {
  id: string;
  user_id: string;
  bonus_id: string;
  status: BonusStatus;
  granted_amount: number;
  remaining_rollover: number;
  progress: number;
  currency: string;
  expires_at?: string;
  last_event_at?: string;
  created_at: string;
  updated_at: string;
  bonuses_new?: Bonus;
  bonus_rules?: BonusRule[];
}

export interface BonusWallet {
  id: string;
  user_id: string;
  type: WalletType;
  balance: number;
  currency: string;
  created_at: string;
  updated_at: string;
}

export interface WalletTransaction {
  id: string;
  wallet_id: string;
  direction: TransactionDirection;
  amount: number;
  ref_type?: string;
  ref_id?: string;
  ledger_key: string;
  meta: Record<string, any>;
  occurred_at: string;
  created_at: string;
}

export interface BonusEvent {
  id: string;
  user_id: string;
  user_bonus_id?: string;
  type: BonusEventType;
  payload: Record<string, any>;
  occurred_at: string;
}

export interface BonusRiskFlag {
  id: string;
  user_id: string;
  score: number;
  reasons: Record<string, any>;
  status: 'none' | 'review' | 'limited' | 'blocked';
  created_at: string;
  updated_at: string;
}

export interface BonusAuditLog {
  id: string;
  actor_type?: string;
  actor_id?: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  meta: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface BonusFormData {
  code?: string;
  type: BonusType;
  name: string;
  description?: string;
  amount_type: 'percent' | 'fixed';
  amount_value: number;
  max_cap?: number;
  min_deposit: number;
  rollover_multiplier: number;
  auto_grant: boolean;
  requires_code: boolean;
  valid_from?: string;
  valid_to?: string;
  max_per_user: number;
  cooldown_hours: number;
  is_active: boolean;
  excluded_providers?: Record<string, any>;
  rules?: {
    category_weights?: Record<string, number>;
    eligible_games?: string[];
    blacklist_games?: string[];
  };
}

export interface BonusClaimRequest {
  bonus_id: string;
  deposit_amount?: number;
  code?: string;
}

export interface BonusProgressInfo {
  progress_percentage: number;
  remaining_amount: number;
  time_remaining?: number;
  category_contributions: Record<string, number>;
  recent_events: BonusEvent[];
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

export const DEFAULT_CATEGORY_WEIGHTS = {
  slots: 1.0,
  live_casino: 0.1,
  table_games: 0.5,
  sports: 0.8,
  virtual_sports: 0.3
};