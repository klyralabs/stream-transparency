export interface PoolPosition {
  poolIndex: number;
  sharesAmount: string;
  valueUsd: number;
  pricePerShare: number;
}

export interface WalletPosition {
  wallet: string;
  totalAssetValue: number;
  pools: PoolPosition[];
}

export interface PoolAggregate {
  poolIndex: number;
  totalValueUsd: number;
  walletCount: number;
}

export interface PositionSummary {
  positionType: string;
  wallets: WalletPosition[];
  poolAggregates: PoolAggregate[];
  totalUsd: number;
  timestamp: string;
}

export interface PortfolioOutput {
  positions: PositionSummary[];
  totalUsd: number;
  timestamp: string;
}
