import { FestivalStatus } from '@prisma/client';
import { IFestivalState } from './festival-state.interface';

/**
 * CLOSED state: The festival is finished. No more submissions.
 * Valid transition: CLOSED -> OPEN (admin can reopen)
 */
export class ClosedState implements IFestivalState {
  readonly status = FestivalStatus.CLOSED;

  allowedTransitions(): FestivalStatus[] {
    return [FestivalStatus.OPEN];
  }

  canTransitionTo(target: FestivalStatus): boolean {
    return target === FestivalStatus.OPEN;
  }
}
