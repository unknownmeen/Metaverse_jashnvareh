import { Module } from '@nestjs/common';
import { UserRepository } from './repositories/user.repository';
import { UserReadService } from './services/user-read.service';
import { UserWriteService } from './services/user-write.service';
import { UserResolver } from './resolvers/user.resolver';

@Module({
  providers: [
    UserRepository,
    UserReadService,
    UserWriteService,
    UserResolver,
  ],
  exports: [UserReadService, UserWriteService, UserRepository],
})
export class UsersModule {}
