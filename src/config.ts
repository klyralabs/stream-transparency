import * as dotenv from 'dotenv';
import { PositionTracker } from './trackers/base';
import { LighterTracker } from './trackers/lighter/tracker';
import { BybitTracker } from './trackers/bybit/tracker';
import { BybitCredentials } from './trackers/bybit/types';
import { BinanceTracker } from './trackers/binance/tracker';
import { BinanceCredentials } from './trackers/binance/types';

dotenv.config();

function parseWalletList(envVar: string | undefined): string[] {
  if (!envVar) return [];
  return envVar.split(',').map(w => w.trim()).filter(Boolean);
}

function parseBybitCredentials(): BybitCredentials[] {
  const keys = parseWalletList(process.env.BYBIT_API_KEYS);
  const secrets = parseWalletList(process.env.BYBIT_API_SECRETS);
  const labels = parseWalletList(process.env.BYBIT_LABELS);

  if (keys.length !== secrets.length) {
    console.warn('Warning: BYBIT_API_KEYS and BYBIT_API_SECRETS must have the same length');
    return [];
  }

  return keys.map((key, i) => ({
    key,
    secret: secrets[i],
    label: labels[i] || undefined
  }));
}

function parseBinanceCredentials(): BinanceCredentials[] {
  const keys = parseWalletList(process.env.BINANCE_API_KEYS);
  const secrets = parseWalletList(process.env.BINANCE_API_SECRETS);
  const labels = parseWalletList(process.env.BINANCE_LABELS);

  if (keys.length !== secrets.length) {
    console.warn('Warning: BINANCE_API_KEYS and BINANCE_API_SECRETS must have the same length');
    return [];
  }

  return keys.map((key, i) => ({
    key,
    secret: secrets[i],
    label: labels[i] || undefined
  }));
}

export function getTrackers(): PositionTracker[] {
  const trackers: PositionTracker[] = [];

  const lighterApiBaseUrl = process.env.LIGHTER_API_BASE_URL || 'https://mainnet.zklighter.elliot.ai/api/v1';
  const lighterWallets = parseWalletList(process.env.LIGHTER_WALLETS);

  if (lighterWallets.length > 0) {
    trackers.push(new LighterTracker(lighterWallets, lighterApiBaseUrl));
  }

  const bybitCredentials = parseBybitCredentials();
  if (bybitCredentials.length > 0) {
    trackers.push(new BybitTracker(bybitCredentials));
  }

  const binanceCredentials = parseBinanceCredentials();
  if (binanceCredentials.length > 0) {
    trackers.push(new BinanceTracker(binanceCredentials));
  }

  return trackers;
}

export function getApiBaseUrl(): string {
  return process.env.LIGHTER_API_BASE_URL || 'https://mainnet.zklighter.elliot.ai/api/v1';
}
