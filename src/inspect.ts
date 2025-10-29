import * as dotenv from 'dotenv';
import { getApiBaseUrl } from './config';
import { LighterAccountResponse } from './trackers/lighter/types';

dotenv.config();

async function inspectWallet(wallet: string, apiBaseUrl: string): Promise<void> {
  const url = `${apiBaseUrl}/account`;
  const params = new URLSearchParams({
    by: 'l1_address',
    value: wallet
  });

  const response = await fetch(`${url}?${params}`);
  const data = await response.json() as LighterAccountResponse;

  console.log(`\n${'='.repeat(60)}`);
  console.log(`Wallet Inspection: ${wallet}`);
  console.log('='.repeat(60));

  const accounts = data.accounts || [];
  console.log(`\nFound ${accounts.length} account(s)\n`);

  for (let i = 0; i < accounts.length; i++) {
    const account = accounts[i];
    console.log(`Account ${i + 1}:`);
    console.log(`  Index: ${account.account_index}`);
    console.log(`  Status: ${account.status === 1 ? 'Active' : 'Inactive'}`);
    console.log(`  Collateral: ${account.collateral}`);

    if (account.shares && account.shares.length > 0) {
      console.log(`\n  Pool Shares (${account.shares.length}):`);
      account.shares.forEach(share => {
        console.log(`    Pool Index: ${share.public_pool_index}`);
        console.log(`    Amount: ${share.shares_amount}`);
        console.log('');
      });
    } else {
      console.log('  Pool Shares: None\n');
    }

    if (account.positions && account.positions.length > 0) {
      console.log(`  Open Positions (${account.positions.length}):`);
      account.positions.forEach(pos => {
        console.log(`    Market ID: ${pos.market_id}`);
        console.log(`    Size: ${pos.size}`);
        console.log(`    Entry Price: ${pos.average_entry_price}`);
        console.log('');
      });
    } else {
      console.log('  Open Positions: None\n');
    }
  }

  console.log('Raw JSON:');
  console.log(JSON.stringify(data, null, 2));
}

async function main() {
  const wallet = process.argv[2] || process.env.LIGHTER_INSPECT_WALLET;

  if (!wallet) {
    console.error('Usage: npm run inspect [wallet_address]');
    console.error('Or set LIGHTER_INSPECT_WALLET in .env');
    process.exit(1);
  }

  const apiBaseUrl = getApiBaseUrl();
  await inspectWallet(wallet, apiBaseUrl);
}

main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
