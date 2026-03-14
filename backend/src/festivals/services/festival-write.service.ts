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
    const slug = await this.ensureUniqueSlug(this.slugFromName(input.name));
    return this.festivalRepository.create({
      slug,
      name: input.name,
      coverImageUrl: input.coverImageUrl,
      conceptMediaType: input.conceptMediaType,
      conceptMediaUrl: input.conceptMediaUrl,
      conceptText: input.conceptText,
      rulesText: input.rulesText,
      status: input.status ?? FestivalStatus.UNOPENED,
    });
  }

  async update(input: UpdateFestivalInput): Promise<Festival> {
    const festival = await this.festivalRepository.findById(input.festivalId);
    if (!festival) {
      throw new NotFoundException('جشنواره یافت نشد');
    }

    const newSlug = await this.ensureUniqueSlug(this.slugFromName(input.name), input.festivalId);
    const updateData: Record<string, unknown> = {
      slug: newSlug,
      name: input.name,
      coverImageUrl: input.coverImageUrl,
      conceptMediaType: input.conceptMediaType ?? undefined,
      conceptMediaUrl: input.conceptMediaUrl ?? null,
      conceptText: input.conceptText ?? null,
      rulesText: input.rulesText ?? null,
    };
    return this.festivalRepository.update(input.festivalId, updateData);
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

  /** تولید slug از نام جریان */
  private slugFromName(name: string): string {
    return (
      name
        .trim()
        .replace(/\s+/g, '-')
        .replace(/\u200c/g, '-') // نیم‌فاصله
        .replace(/[^\p{L}\p{N}-]/gu, '')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '') || 'جریان'
    );
  }

  /** اطمینان از یکتا بودن slug */
  private async ensureUniqueSlug(baseSlug: string, excludeFestivalId?: string): Promise<string> {
    let slug = baseSlug;
    let suffix = 0;
    while (true) {
      const existing = await this.festivalRepository.findBySlug(slug);
      if (!existing || existing.id === excludeFestivalId) return slug;
      suffix++;
      slug = `${baseSlug}-${suffix}`;
    }
  }
}
