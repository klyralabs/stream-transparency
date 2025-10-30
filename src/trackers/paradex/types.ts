export interface ParadexWallet {
  address: string;
  key: string;
  label?: string;
}

export interface ParadexAccountResponse {
  account: string;
  account_value: string;
  free_collateral: string;
  initial_margin_requirement: string;
  maintenance_margin_requirement: string;
  margin_cushion: string;
  seq_no: number;
  settlement_asset: string;
  status: string;
  total_collateral: string;
  updated_at: number;
}
