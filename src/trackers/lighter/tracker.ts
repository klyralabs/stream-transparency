import { PositionTracker } from '../base';
import { PositionSummary, WalletPosition, PoolPosition, PoolAggregate } from '../../types';
import { LighterPoolResponse, LighterAccountResponse } from './types';

export class LighterTracker extends PositionTracker {
  private wallets: string[];
  private apiBaseUrl: string;
  private poolPriceCache: Map<number, number> = new Map();

  constructor(wallets: string[], apiBaseUrl: string) {
    super();
    this.wallets = wallets;
    this.apiBaseUrl = apiBaseUrl;
  }

  async getPositions(): Promise<PositionSummary> {
    const walletPositions: WalletPosition[] = [];
    const poolTotals = new Map<number, { value: number; walletCount: Set<string> }>();

    for (const wallet of this.wallets) {
      const accountData = await this.fetchAccountData(wallet);
      const totalAssetValue = this.extractTotalAssetValue(accountData);
      const pools: PoolPosition[] = [];

      for (const account of accountData.accounts || []) {
        for (const share of account.shares || []) {
          const poolIndex = share.public_pool_index;
          const pricePerShare = await this.getPoolPrice(poolIndex);
          const valueUsd = parseFloat(share.shares_amount) * pricePerShare;

          pools.push({
            poolIndex,
            sharesAmount: share.shares_amount,
            valueUsd,
            pricePerShare
          });

          const current = poolTotals.get(poolIndex) || { value: 0, walletCount: new Set<string>() };
          current.value += valueUsd;
          current.walletCount.add(wallet);
          poolTotals.set(poolIndex, current);
        }
      }

      walletPositions.push({
        wallet,
        totalAssetValue,
        pools
      });
    }

    const poolAggregates: PoolAggregate[] = Array.from(poolTotals.entries()).map(([poolIndex, data]) => ({
      poolIndex,
      totalValueUsd: data.value,
      walletCount: data.walletCount.size
    }));

    const totalPoolValue = poolAggregates.reduce((sum, pool) => sum + pool.totalValueUsd, 0);
    const totalAssetValueSum = walletPositions.reduce((sum, w) => sum + w.totalAssetValue, 0);
    const totalUsd = totalPoolValue + totalAssetValueSum;

    return {
      positionType: 'Lighter',
      category: 'DEX',
      wallets: walletPositions,
      poolAggregates,
      totalUsd,
      timestamp: new Date().toISOString()
    };
  }

  private async fetchAccountData(wallet: string): Promise<LighterAccountResponse> {
    const url = `${this.apiBaseUrl}/account`;
    const params = new URLSearchParams({
      by: 'l1_address',
      value: wallet
    });

    const response = await fetch(`${url}?${params}`);
    return await response.json() as LighterAccountResponse;
  }

  private extractTotalAssetValue(accountData: LighterAccountResponse): number {
    let total = 0;
    for (const account of accountData.accounts || []) {
      if (account.total_asset_value) {
        total += parseFloat(account.total_asset_value);
      }
    }
    return total;
  }

  private async getPoolPrice(poolIndex: number): Promise<number> {
    if (this.poolPriceCache.has(poolIndex)) {
      return this.poolPriceCache.get(poolIndex)!;
    }

    const url = `${this.apiBaseUrl}/publicPoolsMetadata`;
    const params = new URLSearchParams({
      index: String(poolIndex + 1),
      limit: '1'
    });

    const response = await fetch(`${url}?${params}`);
    const data = await response.json() as LighterPoolResponse;

    const pool = data.public_pools[0];
    const pricePerShare = parseFloat(pool.total_asset_value) / parseFloat(pool.total_shares);

    this.poolPriceCache.set(poolIndex, pricePerShare);
    return pricePerShare;
  }
}
