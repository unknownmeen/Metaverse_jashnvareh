import { Resolver, Query, Mutation, Args, ID, ResolveField, Parent } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Role, User } from '@prisma/client';
import { CommentModel } from '../models/comment.model';
import { UserModel } from '../../users/models/user.model';
import { CommentReadService } from '../services/comment-read.service';
import { CommentWriteService } from '../services/comment-write.service';
import { AddCommentInput } from '../dto/add-comment.input';
import { GqlAuthGuard, RolesGuard } from '../../common/guards';
import { CurrentUser, Roles } from '../../common/decorators';
import { UserReadService } from '../../users/services/user-read.service';

@Resolver(() => CommentModel)
export class CommentResolver {
  constructor(
    private readonly commentReadService: CommentReadService,
    private readonly commentWriteService: CommentWriteService,
    private readonly userReadService: UserReadService,
  ) {}

  @Query(() => [CommentModel], { name: 'imageComments' })
  @UseGuards(GqlAuthGuard)
  async imageComments(@Args('imageId', { type: () => ID }) imageId: string) {
    return this.commentReadService.findByImageId(imageId);
  }

  @Mutation(() => CommentModel)
  @UseGuards(GqlAuthGuard)
  async addComment(
    @CurrentUser() user: User,
    @Args('input') input: AddCommentInput,
  ) {
    return this.commentWriteService.addComment(user, input);
  }

  /**
   * Admin-only pinned review comment.
   */
  @Mutation(() => CommentModel)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async addAdminReview(
    @CurrentUser() user: User,
    @Args('input') input: AddCommentInput,
  ) {
    return this.commentWriteService.addAdminReview(user, input);
  }

  @ResolveField('author', () => UserModel)
  async resolveAuthor(@Parent() comment: { userId: string }) {
    return this.userReadService.findById(comment.userId);
  }
}
