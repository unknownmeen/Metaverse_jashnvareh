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
import { UserModel } from '../../users/models/user.model';
import { ImageReadService } from '../services/image-read.service';
import { ImageWriteService } from '../services/image-write.service';
import { RatingReadService } from '../../ratings/services/rating-read.service';
import { UserReadService } from '../../users/services/user-read.service';
import { UploadImageInput } from '../dto/upload-image.input';
import { GqlAuthGuard, RolesGuard } from '../../common/guards';
import { CurrentUser, Roles } from '../../common/decorators';

@Resolver(() => ImageModel)
export class ImageResolver {
  constructor(
    private readonly imageReadService: ImageReadService,
    private readonly imageWriteService: ImageWriteService,
    private readonly ratingReadService: RatingReadService,
    private readonly userReadService: UserReadService,
  ) {}

  @Query(() => ImageModel, { name: 'image' })
  @UseGuards(GqlAuthGuard)
  async image(@Args('id', { type: () => ID }) id: string) {
    return this.imageReadService.findById(id);
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
  @Roles(Role.ADMIN)
  async toggleTopImage(@Args('imageId', { type: () => ID }) imageId: string) {
    return this.imageWriteService.toggleTopImage(imageId);
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

  @ResolveField('commentCount', () => Int)
  async resolveCommentCount(@Parent() image: { id: string }): Promise<number> {
    return this.imageReadService.getCommentCount(image.id);
  }
}
