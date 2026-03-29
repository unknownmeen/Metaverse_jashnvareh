import { Module } from '@nestjs/common';

import { ReleaseResolver } from './resolvers/release.resolver';
import { ReleaseService } from './services/release.service';

@Module({
  providers: [ReleaseResolver, ReleaseService],
  exports: [ReleaseService],
})
export class ReleasesModule {}
