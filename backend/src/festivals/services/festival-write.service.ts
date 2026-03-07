import { Injectable, NotFoundException } from '@nestjs/common';
import { Festival, FestivalStatus } from '@prisma/client';
import { FestivalRepository } from '../repositories/festival.repository';
import { FestivalStateMachine } from '../state/festival-state-machine';
import { CreateFestivalInput } from '../dto/create-festival.input';
import { UpdateFestivalInput } from '../dto/update-festival.input';

@Injectable()
export class FestivalWriteService {
  constructor(
    private readonly festivalRepository: FestivalRepository,
    private readonly stateMachine: FestivalStateMachine,
  ) {}

  async create(input: CreateFestivalInput): Promise<Festival> {
    return this.festivalRepository.create({
      name: input.name,
      coverImageUrl: input.coverImageUrl,
      conceptMediaType: input.conceptMediaType,
      conceptMediaUrl: input.conceptMediaUrl,
      conceptText: input.conceptText,
      rulesText: input.rulesText,
      status: FestivalStatus.UNOPENED,
    });
  }

  async update(input: UpdateFestivalInput): Promise<Festival> {
    const festival = await this.festivalRepository.findById(input.festivalId);
    if (!festival) {
      throw new NotFoundException('جشنواره یافت نشد');
    }

    return this.festivalRepository.update(input.festivalId, {
      name: input.name,
      coverImageUrl: input.coverImageUrl,
      conceptMediaType: input.conceptMediaType ?? undefined,
      conceptMediaUrl: input.conceptMediaUrl ?? null,
      conceptText: input.conceptText ?? null,
      rulesText: input.rulesText ?? null,
    });
  }

  /**
   * Updates festival status through the State Machine.
   * The state machine validates the transition and throws if invalid.
   */
  async updateStatus(festivalId: string, newStatus: FestivalStatus): Promise<Festival> {
    const festival = await this.festivalRepository.findById(festivalId);
    if (!festival) {
      throw new NotFoundException('جشنواره یافت نشد');
    }

    // State Machine validates the transition
    const validatedStatus = this.stateMachine.transition(festival.status, newStatus);

    return this.festivalRepository.updateStatus(festivalId, validatedStatus);
  }

  /**
   * Deletes a festival. Cascades to images, comments, and ratings.
   */
  async delete(festivalId: string): Promise<boolean> {
    const festival = await this.festivalRepository.findById(festivalId);
    if (!festival) {
      throw new NotFoundException('جشنواره یافت نشد');
    }

    await this.festivalRepository.delete(festivalId);
    return true;
  }
}
