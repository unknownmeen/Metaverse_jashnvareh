import {
  Resolver,
  Query,
  Mutation,
  Args,
  ID,
  ResolveField,
  Parent,
  Context,
  Float,
  Int,
} from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Role, User } from '@prisma/client';
import { ImageModel } from '../models/image.model';
import { FestivalModel } from '../../festivals/models/festival.model';
import { UserModel } from '../../users/models/user.model';
import { ImageReadService } from '../services/image-read.service';
import { ImageWriteService } from '../services/image-write.service';
import { RatingReadService } from '../../ratings/services/rating-read.service';
import { UserReadService } from '../../users/services/user-read.service';
import { FestivalReadService } from '../../festivals/services/festival-read.service';
import { UploadImageInput } from '../dto/upload-image.input';
import { GqlAuthGuard, RolesGuard } from '../../common/guards';
import { CurrentUser, Roles } from '../../common/decorators';
import { canSeeJudgeSignals } from '../../common/utils/role.util';

@Resolver(() => ImageModel)
export class ImageResolver {
  constructor(
    private readonly imageReadService: ImageReadService,
    private readonly imageWriteService: ImageWriteService,
    private readonly ratingReadService: RatingReadService,
    private readonly userReadService: UserReadService,
    private readonly festivalReadService: FestivalReadService,
  ) {}

  @Query(() => ImageModel, { name: 'image' })
  @UseGuards(GqlAuthGuard)
  async image(@Args('idOrSlug', { type: () => String }) idOrSlug: string) {
    return this.imageReadService.findByIdOrSlug(idOrSlug);
  }

  @Query(() => [ImageModel], { name: 'festivalImages' })
  @UseGuards(GqlAuthGuard)
  async festivalImages(@Args('festivalId', { type: () => ID }) festivalId: string) {
    return this.imageReadService.findByFestivalId(festivalId);
  }

  @Query(() => [ImageModel], { name: 'myImages' })
  @UseGuards(GqlAuthGuard)
  async myImages(@CurrentUser() user: User) {
    return this.imageReadService.findByUserId(user.id);
  }

  @Mutation(() => ImageModel)
  @UseGuards(GqlAuthGuard)
  async uploadImage(
    @CurrentUser() user: User,
    @Args('input') input: UploadImageInput,
  ) {
    return this.imageWriteService.upload(user.id, input);
  }

  @Mutation(() => ImageModel)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  async toggleTopImage(@CurrentUser() user: User, @Args('imageId', { type: () => ID }) imageId: string) {
    return this.imageWriteService.toggleTopImage(user.id, imageId);
  }

  @Mutation(() => ImageModel, { name: 'deleteImage' })
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  async deleteImage(@Args('imageId', { type: () => ID }) imageId: string) {
    return this.imageWriteService.deleteImage(imageId);
  }

  /**
   * Resolve the `author` field on Image.
   * The User model's `visibleName` field resolver will then
   * handle the gender masking automatically.
   */
  @ResolveField('author', () => UserModel)
  async resolveAuthor(@Parent() image: { userId: string }) {
    return this.userReadService.findById(image.userId);
  }

  @ResolveField('averageRating', () => Float, { nullable: true })
  async resolveAverageRating(@Parent() image: { id: string }): Promise<number | null> {
    const result = await this.ratingReadService.getAverageRating(image.id);
    return result.count > 0 ? result.average : null;
  }

  @ResolveField('judgeAverageRating', () => Float, { nullable: true })
  async resolveJudgeAverageRating(
    @Parent() image: { id: string },
    @Context() ctx: { req: { user?: User } },
  ): Promise<number | null> {
    const user = ctx.req?.user;
    if (!user || !canSeeJudgeSignals(user.role)) {
      return null;
    }
    const result = await this.ratingReadService.getJudgeAverageRating(image.id);
    return result.count > 0 ? result.average : null;
  }

  @ResolveField('commentCount', () => Int)
  async resolveCommentCount(@Parent() image: { id: string }): Promise<number> {
    return this.imageReadService.getCommentCount(image.id);
  }

  @ResolveField('judgeRatingCount', () => Int)
  async resolveJudgeRatingCount(
    @Parent() image: { id: string },
    @Context() ctx: { req: { user?: User } },
  ): Promise<number> {
    const user = ctx.req?.user;
    if (!user || !canSeeJudgeSignals(user.role)) {
      return 0;
    }
    const result = await this.ratingReadService.getJudgeAverageRating(image.id);
    return result.count;
  }

  @ResolveField('festival', () => FestivalModel, { nullable: true })
  async resolveFestival(@Parent() image: { festivalId: string }) {
    return this.festivalReadService.findById(image.festivalId);
  }
}
