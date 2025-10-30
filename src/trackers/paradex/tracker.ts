import { PositionTracker } from '../base';
import { PositionSummary, WalletPosition } from '../../types';
import { ParadexWallet, ParadexAccountResponse } from './types';

export class ParadexTracker extends PositionTracker {
  private wallets: ParadexWallet[];
  private apiBaseUrl: string;

  constructor(wallets: ParadexWallet[], apiBaseUrl: string = 'https://api.prod.paradex.trade/v1') {
    super();
    this.wallets = wallets;
    this.apiBaseUrl = apiBaseUrl;
  }

  async getPositions(): Promise<PositionSummary> {
    const walletPositions: WalletPosition[] = [];
    let totalUsd = 0;

    for (const wallet of this.wallets) {
      const url = `${this.apiBaseUrl}/account`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${wallet.key}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        console.error(`Failed to fetch account data: ${response.status} ${response.statusText}`);
        const errorText = await response.text();
        console.error(`Error details: ${errorText}`);
        continue;
      }

      const data = await response.json() as ParadexAccountResponse;

      const accountValue = parseFloat(data.account_value || '0');

      walletPositions.push({
        wallet: wallet.address,
        totalAssetValue: accountValue,
        pools: []
      });

      totalUsd += accountValue;
    }

    return {
      positionType: 'Paradex',
      category: 'DEX',
      wallets: walletPositions,
      poolAggregates: [],
      totalUsd,
      timestamp: new Date().toISOString()
    };
  }
}
