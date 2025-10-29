import { RestClientV5 } from 'bybit-api';
import { PositionTracker } from '../base';
import { PositionSummary, WalletPosition } from '../../types';
import { BybitCredentials } from './types';

export class BybitTracker extends PositionTracker {
  private credentials: BybitCredentials[];

  constructor(credentials: BybitCredentials[]) {
    super();
    this.credentials = credentials;
  }

  async getPositions(): Promise<PositionSummary> {
    const walletPositions: WalletPosition[] = [];
    let totalUsd = 0;

    for (const cred of this.credentials) {
      const client = new RestClientV5({
        key: cred.key,
        secret: cred.secret,
        testnet: false,
      });

      const wallet = cred.label || cred.key.substring(0, 8);
      let accountTotal = 0;

      console.log(`\n=== ${wallet} ===`);

      const unifiedResponse = await client.getWalletBalance({ accountType: 'UNIFIED' });

      if (unifiedResponse.retCode === 0) {
        const list = unifiedResponse.result?.list || [];
        for (const account of list) {
          const balance = parseFloat(account.totalWalletBalance || '0');
          if (balance !== 0) {
            console.log(`UNIFIED: $${balance.toLocaleString()}`);
            accountTotal += balance;
          }
        }
      } else {
        for (const accountType of ['SPOT', 'CONTRACT', 'OPTION', 'FUND'] as const) {
          const response = await client.getWalletBalance({ accountType });

          if (response.retCode !== 0) {
            continue;
          }

          const list = response.result?.list || [];
          for (const account of list) {
            const balance = parseFloat(account.totalWalletBalance || '0');
            if (balance !== 0) {
              console.log(`${accountType}: $${balance.toLocaleString()}`);
              accountTotal += balance;
            }
          }
        }
      }

      console.log(`Total: $${accountTotal.toLocaleString()}\n`);

      walletPositions.push({
        wallet,
        totalAssetValue: accountTotal,
        pools: []
      });

      totalUsd += accountTotal;
    }

    return {
      positionType: 'Bybit',
      wallets: walletPositions,
      poolAggregates: [],
      totalUsd,
      timestamp: new Date().toISOString()
    };
  }
}
