export type WithdrawalMethod = 'bank' | 'papara' | 'crypto';

export type Withdrawal = {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  method: WithdrawalMethod;
  payout_details: any | null; // {iban}|{papara_id,phone}|{asset,network,address,tag}
  fee: number;
  provider_ref?: string | null;
  tx_hash?: string | null;
  network?: string | null;
  asset?: string | null;
  reviewer_id?: string | null;
  note?: string | null;
  created_at: string;
  updated_at: string;
};