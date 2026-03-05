import { Module } from '@nestjs/common';
import { CommentRepository } from './repositories/comment.repository';
import { CommentReadService } from './services/comment-read.service';
import { CommentWriteService } from './services/comment-write.service';
import { CommentResolver } from './resolvers/comment.resolver';
import { ImagesModule } from '../images/images.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [ImagesModule, UsersModule],
  providers: [
    CommentRepository,
    CommentReadService,
    CommentWriteService,
    CommentResolver,
  ],
  exports: [CommentReadService, CommentWriteService],
})
export class CommentsModule {}
