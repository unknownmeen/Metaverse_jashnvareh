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

  async getImageCount(festivalId: string): Promise<number> {
    return this.festivalRepository.countImages(festivalId);
  }
}
