import { BadRequestException, Injectable } from '@nestjs/common';
import { FestivalStatus } from '@prisma/client';
import { IFestivalState } from './festival-state.interface';
import { UnopenedState } from './unopened.state';
import { OpenState } from './open.state';
import { ClosedState } from './closed.state';

/**
 * Festival State Machine
 *
 * Manages valid state transitions for festival lifecycle:
 *   UNOPENED  ──▶  OPEN  ──▶  CLOSED
 *
 * Each state is an isolated class implementing IFestivalState.
 * The machine resolves the current state, validates the transition,
 * and returns the new status if valid.
 */
@Injectable()
export class FestivalStateMachine {
  private readonly stateMap: Map<FestivalStatus, IFestivalState>;

  constructor() {
    this.stateMap = new Map<FestivalStatus, IFestivalState>([
      [FestivalStatus.UNOPENED, new UnopenedState()],
      [FestivalStatus.OPEN, new OpenState()],
      [FestivalStatus.CLOSED, new ClosedState()],
    ]);
  }

  /**
   * Resolves the IFestivalState instance for the given status.
   */
  private resolveState(status: FestivalStatus): IFestivalState {
    const state = this.stateMap.get(status);
    if (!state) {
      throw new BadRequestException(`Unknown festival status: ${status}`);
    }
    return state;
  }

  /**
   * Validates and returns the new status if the transition is valid.
   * Throws BadRequestException with a descriptive message if not.
   */
  transition(currentStatus: FestivalStatus, targetStatus: FestivalStatus): FestivalStatus {
    if (currentStatus === targetStatus) {
      throw new BadRequestException(
        `جشنواره در حال حاضر در وضعیت ${currentStatus} قرار دارد`,
      );
    }

    const currentState = this.resolveState(currentStatus);

    if (!currentState.canTransitionTo(targetStatus)) {
      const allowed = currentState.allowedTransitions();
      throw new BadRequestException(
        `تغییر وضعیت از ${currentStatus} به ${targetStatus} مجاز نیست. ` +
        `تغییرات مجاز: [${allowed.join(', ') || 'هیچ‌کدام'}]`,
      );
    }

    return targetStatus;
  }

  /**
   * Returns allowed transitions from the given status.
   */
  getAllowedTransitions(status: FestivalStatus): FestivalStatus[] {
    return this.resolveState(status).allowedTransitions();
  }
}
