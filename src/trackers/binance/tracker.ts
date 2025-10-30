import { USDMClient } from 'binance';
import { PositionTracker } from '../base';
import { PositionSummary, WalletPosition } from '../../types';
import { BinanceCredentials } from './types';

export class BinanceTracker extends PositionTracker {
  private credentials: BinanceCredentials[];

  constructor(credentials: BinanceCredentials[]) {
    super();
    this.credentials = credentials;
  }

  async getPositions(): Promise<PositionSummary> {
    const walletPositions: WalletPosition[] = [];
    let totalUsd = 0;

    for (const cred of this.credentials) {
      const futuresClient = new USDMClient({
        api_key: cred.key,
        api_secret: cred.secret,
      });

      const wallet = cred.label || cred.key.substring(0, 8);

      const futuresAccountInfo = await futuresClient.getAccountInformationV3();
      const balance = parseFloat(String(futuresAccountInfo.totalWalletBalance || 0));

      walletPositions.push({
        wallet,
        totalAssetValue: balance,
        pools: []
      });

      totalUsd += balance;
    }

    return {
      positionType: 'Binance',
      category: 'CEX',
      wallets: walletPositions,
      poolAggregates: [],
      totalUsd,
      timestamp: new Date().toISOString()
    };
  }
}
