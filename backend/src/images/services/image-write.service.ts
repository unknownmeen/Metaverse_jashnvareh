import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { FestivalStatus, Image } from '@prisma/client';
import { randomUUID } from 'crypto';
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

    const urls = this.normalizeUrls(input.urls);
    const safeCoverIndex = Math.min(input.coverIndex ?? 0, urls.length - 1);
    const coverUrl = urls[safeCoverIndex];
    const slug = await this.generateSlug(input.title ?? '');
    return this.imageRepository.create({
      slug,
      url: coverUrl,
      galleryUrls: urls,
      title: input.title,
      tags: input.tags ?? [],
      festival: { connect: { id: input.festivalId } },
      user: { connect: { id: userId } },
    });
  }

  private normalizeUrls(urls: string[]): string[] {
    const cleanedUrls = Array.from(
      new Set((urls ?? []).map((url) => url.trim()).filter(Boolean)),
    );

    if (cleanedUrls.length === 0) {
      throw new BadRequestException('حداقل یک تصویر برای ارسال لازم است');
    }

    if (cleanedUrls.length > 3) {
      throw new BadRequestException('حداکثر سه تصویر در هر پست قابل ثبت است');
    }

    return cleanedUrls;
  }

  /** تولید slug از عنوان با fallback برای تضمین یکتایی */
  private async generateSlug(title: string): Promise<string> {
    const base = (this.slugFromTitle(title) || 'تصویر').slice(0, 100);
    const uniqueSuffix = randomUUID().slice(0, 8);
    return `${base}-${uniqueSuffix}`;
  }

  private slugFromTitle(title: string): string {
    try {
      return (
        title
          .trim()
          .replace(/\s+/g, '-')
          .replace(/\u200c/g, '-')
          .replace(/[^\u0600-\u06FFa-zA-Z0-9-]/g, '')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '') || ''
      );
    } catch {
      return '';
    }
  }

  /**
   * Toggle the "Top Image" (featured) status.
   * Emits IMAGE_TOP_SELECTED event when an image is marked as top.
   */
  async toggleTopImage(userId: string, imageId: string): Promise<Image> {
    const image = await this.imageRepository.findById(imageId);
    if (!image) {
      throw new NotFoundException('تصویر یافت نشد');
    }

    const festival = await this.festivalRepository.findById(image.festivalId);
    if (!festival) {
      throw new NotFoundException('جشنواره یافت نشد');
    }
    if (festival.creatorId && festival.creatorId !== userId) {
      throw new ForbiddenException('فقط دبیر سازنده این جشنواره می‌تواند اثر منتخب انتخاب کند');
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
