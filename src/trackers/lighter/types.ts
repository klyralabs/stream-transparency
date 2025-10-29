export interface LighterPoolResponse {
  public_pools: Array<{
    total_asset_value: string;
    total_shares: string;
  }>;
}

export interface LighterAccountResponse {
  accounts: Array<{
    account_index: number;
    status: number;
    collateral: string;
    total_asset_value?: string;
    cross_asset_value?: string;
    shares: Array<{
      public_pool_index: number;
      shares_amount: string;
      entry_usdc?: string;
    }>;
    positions: Array<{
      market_id: number;
      size: string;
      average_entry_price: string;
    }>;
  }>;
}
