import { Injectable } from '@nestjs/common';
import { RatingRepository } from '../repositories/rating.repository';

@Injectable()
export class RatingReadService {
  constructor(private readonly ratingRepository: RatingRepository) {}

  async getAverageRating(imageId: string) {
    return this.ratingRepository.getAverageRating(imageId);
  }

  async getUserRating(imageId: string, userId: string) {
    return this.ratingRepository.findByImageAndUser(imageId, userId);
  }
}
