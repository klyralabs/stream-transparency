import * as dotenv from 'dotenv';
import { PositionTracker } from './trackers/base';
import { LighterTracker } from './trackers/lighter/tracker';

dotenv.config();

function parseWalletList(envVar: string | undefined): string[] {
  if (!envVar) return [];
  return envVar.split(',').map(w => w.trim()).filter(Boolean);
}

export function getTrackers(): PositionTracker[] {
  const trackers: PositionTracker[] = [];

  const lighterApiBaseUrl = process.env.LIGHTER_API_BASE_URL || 'https://mainnet.zklighter.elliot.ai/api/v1';
  const lighterWallets = parseWalletList(process.env.LIGHTER_WALLETS);

  if (lighterWallets.length > 0) {
    trackers.push(new LighterTracker(lighterWallets, lighterApiBaseUrl));
  }

  return trackers;
}

export function getApiBaseUrl(): string {
  return process.env.LIGHTER_API_BASE_URL || 'https://mainnet.zklighter.elliot.ai/api/v1';
}
