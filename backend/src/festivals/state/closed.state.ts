import { FestivalStatus } from '@prisma/client';
import { IFestivalState } from './festival-state.interface';

/**
 * CLOSED state: The festival is finished. No more submissions.
 * Terminal state — no valid transitions.
 */
export class ClosedState implements IFestivalState {
  readonly status = FestivalStatus.CLOSED;

  allowedTransitions(): FestivalStatus[] {
    return [];
  }

  canTransitionTo(_target: FestivalStatus): boolean {
    return false;
  }
}
