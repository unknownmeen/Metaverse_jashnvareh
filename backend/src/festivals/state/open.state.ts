import { FestivalStatus } from '@prisma/client';
import { IFestivalState } from './festival-state.interface';

/**
 * OPEN state: The festival is accepting submissions.
 * Valid transition: OPEN -> CLOSED
 */
export class OpenState implements IFestivalState {
  readonly status = FestivalStatus.OPEN;

  allowedTransitions(): FestivalStatus[] {
    return [FestivalStatus.CLOSED];
  }

  canTransitionTo(target: FestivalStatus): boolean {
    return this.allowedTransitions().includes(target);
  }
}
