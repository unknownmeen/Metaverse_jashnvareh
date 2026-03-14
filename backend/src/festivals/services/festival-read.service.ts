import { Injectable, NotFoundException } from '@nestjs/common';
import { Festival } from '@prisma/client';
import { FestivalRepository } from '../repositories/festival.repository';

@Injectable()
export class FestivalReadService {
  constructor(private readonly festivalRepository: FestivalRepository) {}

  async findAll(): Promise<Festival[]> {
    return this.festivalRepository.findAll();
  }

  async findById(id: string): Promise<Festival> {
    const festival = await this.festivalRepository.findById(id);
    if (!festival) {
      throw new NotFoundException('جشنواره یافت نشد');
    }
    return festival;
  }

  async findBySlug(slug: string): Promise<Festival> {
    const festival = await this.festivalRepository.findBySlug(slug);
    if (!festival) {
      throw new NotFoundException('جشنواره یافت نشد');
    }
    return festival;
  }

  /** Resolves by id (UUID) or slug. Tries id first if it looks like UUID. */
  async findByIdOrSlug(idOrSlug: string): Promise<Festival> {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);
    const festival = isUuid
      ? await this.festivalRepository.findById(idOrSlug)
      : await this.festivalRepository.findBySlug(idOrSlug);
    if (!festival) {
      throw new NotFoundException('جشنواره یافت نشد');
    }
    return festival;
  }

  async getImageCount(festivalId: string): Promise<number> {
    return this.festivalRepository.countImages(festivalId);
  }
}
