import { FestivalStatus } from '@prisma/client';
import { IFestivalState } from './festival-state.interface';

/**
 * UNOPENED state: The festival has not started yet.
 * Valid transition: UNOPENED -> OPEN
 */
export class UnopenedState implements IFestivalState {
  readonly status = FestivalStatus.UNOPENED;

  allowedTransitions(): FestivalStatus[] {
    return [FestivalStatus.OPEN];
  }

  canTransitionTo(target: FestivalStatus): boolean {
    return this.allowedTransitions().includes(target);
  }
}
