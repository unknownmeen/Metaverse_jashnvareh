import { FestivalStatus } from '@prisma/client';

/**
 * State interface for the Festival State Machine.
 * Each concrete state class implements this to define
 * which transitions are valid from that state.
 */
export interface IFestivalState {
  readonly status: FestivalStatus;

  /**
   * Returns the list of statuses this state can transition to.
   */
  allowedTransitions(): FestivalStatus[];

  /**
   * Validates whether a transition to the target status is permitted.
   * Throws an error if not.
   */
  canTransitionTo(target: FestivalStatus): boolean;
}
