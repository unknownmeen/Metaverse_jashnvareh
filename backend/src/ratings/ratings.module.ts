import { Module, forwardRef } from '@nestjs/common';
import { RatingRepository } from './repositories/rating.repository';
import { RatingReadService } from './services/rating-read.service';
import { RatingWriteService } from './services/rating-write.service';
import { RatingResolver } from './resolvers/rating.resolver';
import { ImageRepository } from '../images/repositories/image.repository';

@Module({
  providers: [
    RatingRepository,
    RatingReadService,
    RatingWriteService,
    RatingResolver,
    ImageRepository,
  ],
  exports: [RatingReadService, RatingWriteService, RatingRepository],
})
export class RatingsModule {}
