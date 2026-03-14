import { Injectable, NotFoundException } from '@nestjs/common';
import { Image } from '@prisma/client';
import { ImageRepository } from '../repositories/image.repository';

@Injectable()
export class ImageReadService {
  constructor(private readonly imageRepository: ImageRepository) {}

  async findById(id: string): Promise<Image> {
    const image = await this.imageRepository.findById(id);
    if (!image) {
      throw new NotFoundException('تصویر یافت نشد');
    }
    return image;
  }

  async findByIdOrSlug(idOrSlug: string): Promise<Image> {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);
    const image = isUuid
      ? await this.imageRepository.findById(idOrSlug)
      : await this.imageRepository.findBySlug(idOrSlug);
    if (!image) {
      throw new NotFoundException('تصویر یافت نشد');
    }
    return image;
  }

  async findByIdWithRelations(id: string) {
    const image = await this.imageRepository.findByIdWithRelations(id);
    if (!image) {
      throw new NotFoundException('تصویر یافت نشد');
    }
    return image;
  }

  async findByFestivalId(festivalId: string): Promise<Image[]> {
    return this.imageRepository.findByFestivalId(festivalId);
  }

  async findByUserId(userId: string): Promise<Image[]> {
    return this.imageRepository.findByUserId(userId);
  }

  async getCommentCount(imageId: string): Promise<number> {
    return this.imageRepository.countComments(imageId);
  }
}
