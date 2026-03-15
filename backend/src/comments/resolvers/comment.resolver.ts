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
import { RatingReadService } from '../../ratings/services/rating-read.service';

@Resolver(() => CommentModel)
export class CommentResolver {
  constructor(
    private readonly commentReadService: CommentReadService,
    private readonly commentWriteService: CommentWriteService,
    private readonly userReadService: UserReadService,
    private readonly ratingReadService: RatingReadService,
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
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  async addAdminReview(
    @CurrentUser() user: User,
    @Args('input') input: AddCommentInput,
  ) {
    return this.commentWriteService.addAdminReview(user, input);
  }

  @Mutation(() => CommentModel)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(Role.JUDGE, Role.JUDGE_LEVEL_1, Role.JUDGE_LEVEL_2, Role.JUDGE_LEVEL_3)
  async addJudgeReview(
    @CurrentUser() user: User,
    @Args('input') input: AddCommentInput,
  ) {
    return this.commentWriteService.addJudgeReview(user, input);
  }

  @ResolveField('author', () => UserModel)
  async resolveAuthor(@Parent() comment: { userId: string }) {
    return this.userReadService.findById(comment.userId);
  }

  @ResolveField('ratingScore', () => Number, { nullable: true })
  async resolveRatingScore(@Parent() comment: { imageId: string; userId: string; isJudgeReview: boolean }) {
    const rating = await this.ratingReadService.getCommentRating(
      comment.imageId,
      comment.userId,
      comment.isJudgeReview,
    );
    return rating?.score ?? null;
  }

  @ResolveField('ratingMaxScore', () => Number, { nullable: true })
  async resolveRatingMaxScore(@Parent() comment: { imageId: string; userId: string; isJudgeReview: boolean }) {
    const rating = await this.ratingReadService.getCommentRating(
      comment.imageId,
      comment.userId,
      comment.isJudgeReview,
    );
    return rating?.maxScore ?? null;
  }
}
