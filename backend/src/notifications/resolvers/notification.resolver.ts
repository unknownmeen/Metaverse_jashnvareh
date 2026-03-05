import { Resolver, Query, Mutation, Args, ID, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { NotificationModel } from '../models/notification.model';
import { NotificationReadService } from '../services/notification-read.service';
import { NotificationWriteService } from '../services/notification-write.service';
import { GqlAuthGuard } from '../../common/guards';
import { CurrentUser } from '../../common/decorators';

@Resolver(() => NotificationModel)
export class NotificationResolver {
  constructor(
    private readonly notificationReadService: NotificationReadService,
    private readonly notificationWriteService: NotificationWriteService,
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
}
