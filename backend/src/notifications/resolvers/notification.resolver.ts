import { Resolver, Query, Mutation, Args, ID, Int, ResolveField, Parent } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { NotificationModel } from '../models/notification.model';
import { NotificationReadService } from '../services/notification-read.service';
import { NotificationWriteService } from '../services/notification-write.service';
import { FestivalReadService } from '../../festivals/services/festival-read.service';
import { ImageReadService } from '../../images/services/image-read.service';
import { GqlAuthGuard } from '../../common/guards';
import { CurrentUser } from '../../common/decorators';

@Resolver(() => NotificationModel)
export class NotificationResolver {
  constructor(
    private readonly notificationReadService: NotificationReadService,
    private readonly notificationWriteService: NotificationWriteService,
    private readonly festivalReadService: FestivalReadService,
    private readonly imageReadService: ImageReadService,
  ) {}

  @Query(() => [NotificationModel], { name: 'myNotifications' })
  @UseGuards(GqlAuthGuard)
  async myNotifications(@CurrentUser() user: User) {
    return this.notificationReadService.findByUserId(user.id);
  }

  @Mutation(() => NotificationModel)
  @UseGuards(GqlAuthGuard)
  async markNotificationAsRead(
    @Args('id', { type: () => ID }) id: string,
  ) {
    return this.notificationWriteService.markAsRead(id);
  }

  @Mutation(() => Int, { description: 'Returns count of updated notifications' })
  @UseGuards(GqlAuthGuard)
  async markAllNotificationsAsRead(@CurrentUser() user: User): Promise<number> {
    return this.notificationWriteService.markAllAsRead(user.id);
  }

  @ResolveField('festivalSlug', () => String, { nullable: true })
  async resolveFestivalSlug(@Parent() notification: { festivalId?: string }): Promise<string | null> {
    if (!notification.festivalId) return null;
    try {
      const festival = await this.festivalReadService.findById(notification.festivalId);
      return festival.slug ?? null;
    } catch {
      return null;
    }
  }

  @ResolveField('imageSlug', () => String, { nullable: true })
  async resolveImageSlug(@Parent() notification: { imageId?: string }): Promise<string | null> {
    if (!notification.imageId) return null;
    try {
      const image = await this.imageReadService.findById(notification.imageId);
      return image.slug ?? null;
    } catch {
      return null;
    }
  }
}
