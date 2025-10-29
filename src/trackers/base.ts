import { PositionSummary } from '../types';

export abstract class PositionTracker {
  abstract getPositions(): Promise<PositionSummary>;
}
