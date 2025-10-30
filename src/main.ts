import { getTrackers } from './config';
import { PortfolioOutput } from './types';

async function main() {
  const trackers = getTrackers();

  if (trackers.length === 0) {
    console.error('No trackers configured. Check your .env file.');
    process.exit(1);
  }

  const positions = await Promise.all(
    trackers.map(tracker => tracker.getPositions())
  );

  const totalCexUsd = positions
    .filter(pos => pos.category === 'CEX')
    .reduce((sum, pos) => sum + pos.totalUsd, 0);

  const totalDexUsd = positions
    .filter(pos => pos.category === 'DEX')
    .reduce((sum, pos) => sum + pos.totalUsd, 0);

  const totalUsd = totalCexUsd + totalDexUsd;

  const output: PortfolioOutput = {
    positions,
    totalCexUsd,
    totalDexUsd,
    totalUsd,
    timestamp: new Date().toISOString()
  };

  console.log(JSON.stringify(output, null, 2));
}

main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
