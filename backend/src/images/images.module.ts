import { Module } from '@nestjs/common';
import { ImageRepository } from './repositories/image.repository';
import { ImageReadService } from './services/image-read.service';
import { ImageWriteService } from './services/image-write.service';
import { ImageResolver } from './resolvers/image.resolver';
import { FestivalsModule } from '../festivals/festivals.module';
import { UsersModule } from '../users/users.module';
import { RatingsModule } from '../ratings/ratings.module';

@Module({
  imports: [FestivalsModule, UsersModule, RatingsModule],
  providers: [
    ImageRepository,
    ImageReadService,
    ImageWriteService,
    ImageResolver,
  ],
  exports: [ImageReadService, ImageWriteService, ImageRepository],
})
export class ImagesModule {}
