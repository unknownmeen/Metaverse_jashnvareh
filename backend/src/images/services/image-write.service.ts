import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { FestivalStatus, Image } from '@prisma/client';
import { ImageRepository } from '../repositories/image.repository';
import { FestivalRepository } from '../../festivals/repositories/festival.repository';
import { UploadImageInput } from '../dto/upload-image.input';
import { ImageTopSelectedEvent } from '../events/image-top-selected.event';

@Injectable()
export class ImageWriteService {
  constructor(
    private readonly imageRepository: ImageRepository,
    private readonly festivalRepository: FestivalRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Upload an image to a festival.
   * Blocks if the festival is not in OPEN status.
   */
  async upload(userId: string, input: UploadImageInput): Promise<Image> {
    const festival = await this.festivalRepository.findById(input.festivalId);
    if (!festival) {
      throw new NotFoundException('جشنواره یافت نشد');
    }

    if (festival.status !== FestivalStatus.OPEN) {
      throw new BadRequestException(
        'ارسال تصویر فقط در وضعیت «باز» جشنواره امکان‌پذیر است',
      );
    }

    return this.imageRepository.create({
      url: input.url,
      title: input.title,
      tags: input.tags ?? [],
      festival: { connect: { id: input.festivalId } },
      user: { connect: { id: userId } },
    });
  }

  /**
   * Toggle the "Top Image" (featured) status.
   * Emits IMAGE_TOP_SELECTED event when an image is marked as top.
   */
  async toggleTopImage(imageId: string): Promise<Image> {
    const image = await this.imageRepository.findById(imageId);
    if (!image) {
      throw new NotFoundException('تصویر یافت نشد');
    }

    const newTopStatus = !image.isTopImage;
    const updatedImage = await this.imageRepository.toggleTopImage(imageId, newTopStatus);

    // Emit event when image is selected as top
    if (newTopStatus) {
      this.eventEmitter.emit(
        'IMAGE_TOP_SELECTED',
        new ImageTopSelectedEvent(updatedImage.id, updatedImage.userId, updatedImage.title ?? ''),
      );
    }

    return updatedImage;
  }
}
