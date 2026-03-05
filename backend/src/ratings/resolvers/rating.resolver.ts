import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { RatingModel, AverageRatingModel } from '../models/rating.model';
import { RatingReadService } from '../services/rating-read.service';
import { RatingWriteService } from '../services/rating-write.service';
import { RateImageInput } from '../dto/rate-image.input';
import { GqlAuthGuard } from '../../common/guards';
import { CurrentUser } from '../../common/decorators';

@Resolver(() => RatingModel)
export class RatingResolver {
  constructor(
    private readonly ratingReadService: RatingReadService,
    private readonly ratingWriteService: RatingWriteService,
  ) {}

  @Query(() => AverageRatingModel, { name: 'imageAverageRating' })
  @UseGuards(GqlAuthGuard)
  async imageAverageRating(@Args('imageId', { type: () => ID }) imageId: string) {
    return this.ratingReadService.getAverageRating(imageId);
  }

  @Mutation(() => RatingModel)
  @UseGuards(GqlAuthGuard)
  async rateImage(
    @CurrentUser() user: User,
    @Args('input') input: RateImageInput,
  ) {
    return this.ratingWriteService.rateImage(user, input);
  }
}
