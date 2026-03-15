import { RatingCategory } from '@prisma/client';
import { Injectable } from '@nestjs/common';
import { RatingRepository } from '../repositories/rating.repository';

@Injectable()
export class RatingReadService {
  constructor(private readonly ratingRepository: RatingRepository) {}

  async getAverageRating(imageId: string) {
    return this.ratingRepository.getAverageRating(imageId, RatingCategory.USER);
  }

  async getJudgeAverageRating(imageId: string) {
    return this.ratingRepository.getJudgeAverageRating(imageId);
  }

  async getUserRating(imageId: string, userId: string) {
    return this.ratingRepository.findByImageAndUser(imageId, userId, RatingCategory.USER);
  }

  async getJudgeRating(imageId: string, userId: string) {
    return this.ratingRepository.findByImageAndUser(imageId, userId, RatingCategory.JUDGE);
  }

  async getCommentRating(imageId: string, userId: string, isJudgeReview: boolean) {
    return this.ratingRepository.findByImageAndUser(
      imageId,
      userId,
      isJudgeReview ? RatingCategory.JUDGE : RatingCategory.USER,
    );
  }
}
