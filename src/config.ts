import * as dotenv from 'dotenv';
import { PositionTracker } from './trackers/base';
import { LighterTracker } from './trackers/lighter/tracker';
import { BybitTracker } from './trackers/bybit/tracker';
import { BybitCredentials } from './trackers/bybit/types';
import { BinanceTracker } from './trackers/binance/tracker';
import { BinanceCredentials } from './trackers/binance/types';
import { ParadexTracker } from './trackers/paradex/tracker';
import { ParadexWallet } from './trackers/paradex/types';

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

function parseParadexWallets(): ParadexWallet[] {
  const addresses = parseWalletList(process.env.PARADEX_WALLETS);
  const keys = parseWalletList(process.env.PARADEX_KEYS);
  const labels = parseWalletList(process.env.PARADEX_LABELS);

  if (addresses.length !== keys.length) {
    console.warn('Warning: PARADEX_WALLETS and PARADEX_KEYS must have the same length');
    return [];
  }

  return addresses.map((address, i) => ({
    address,
    key: keys[i],
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

  const paradexWallets = parseParadexWallets();
  if (paradexWallets.length > 0) {
    trackers.push(new ParadexTracker(paradexWallets));
  }

  return trackers;
}

export function getApiBaseUrl(): string {
  return process.env.LIGHTER_API_BASE_URL || 'https://mainnet.zklighter.elliot.ai/api/v1';
}
