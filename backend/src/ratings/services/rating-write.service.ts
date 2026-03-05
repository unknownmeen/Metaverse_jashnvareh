import { Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Rating, User } from '@prisma/client';
import { RatingRepository } from '../repositories/rating.repository';
import { ImageRepository } from '../../images/repositories/image.repository';
import { RateImageInput } from '../dto/rate-image.input';

@Injectable()
export class RatingWriteService {
  constructor(
    private readonly ratingRepository: RatingRepository,
    private readonly imageRepository: ImageRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async rateImage(user: User, input: RateImageInput): Promise<Rating> {
    const image = await this.imageRepository.findById(input.imageId);
    if (!image) {
      throw new NotFoundException('تصویر یافت نشد');
    }

    const rating = await this.ratingRepository.upsert(input.imageId, user.id, input.score);

    // Emit event to notify image owner
    if (image.userId !== user.id) {
      this.eventEmitter.emit('RATING_ADDED', {
        imageId: image.id,
        imageOwnerId: image.userId,
        raterId: user.id,
        score: input.score,
      });
    }

    return rating;
  }
}
