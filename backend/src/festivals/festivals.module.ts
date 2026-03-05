import { Module } from '@nestjs/common';
import { FestivalRepository } from './repositories/festival.repository';
import { FestivalReadService } from './services/festival-read.service';
import { FestivalWriteService } from './services/festival-write.service';
import { FestivalResolver } from './resolvers/festival.resolver';
import { FestivalStateMachine } from './state/festival-state-machine';

@Module({
  providers: [
    FestivalRepository,
    FestivalReadService,
    FestivalWriteService,
    FestivalResolver,
    FestivalStateMachine,
  ],
  exports: [FestivalReadService, FestivalWriteService, FestivalRepository],
})
export class FestivalsModule {}
