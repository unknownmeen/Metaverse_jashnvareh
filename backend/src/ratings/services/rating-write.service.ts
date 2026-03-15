import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Rating, RatingCategory, User } from '@prisma/client';
import { RatingRepository } from '../repositories/rating.repository';
import { ImageRepository } from '../../images/repositories/image.repository';
import { RateImageInput } from '../dto/rate-image.input';
import { getJudgeMaxScore, isJudgeRole } from '../../common/utils/role.util';

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
    if (image.userId === user.id) {
      throw new ForbiddenException('کاربر نمی‌تواند به اثر خودش امتیاز بدهد');
    }

    const isJudge = isJudgeRole(user.role);
    const maxScore = isJudge ? getJudgeMaxScore(user.role) : 5;
    if (!maxScore) {
      throw new ForbiddenException('نوع نقش برای امتیازدهی معتبر نیست');
    }
    if (input.score > maxScore) {
      throw new ForbiddenException(`حداکثر امتیاز مجاز برای این نقش ${maxScore} است`);
    }

    const rating = await this.ratingRepository.upsert(
      input.imageId,
      user.id,
      input.score,
      maxScore,
      isJudge ? RatingCategory.JUDGE : RatingCategory.USER,
    );

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
