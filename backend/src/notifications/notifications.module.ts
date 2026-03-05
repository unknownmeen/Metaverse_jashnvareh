import { Module } from '@nestjs/common';
import { NotificationRepository } from './repositories/notification.repository';
import { NotificationReadService } from './services/notification-read.service';
import { NotificationWriteService } from './services/notification-write.service';
import { NotificationResolver } from './resolvers/notification.resolver';
import { NotificationListener } from './listeners/notification.listener';

@Module({
  providers: [
    NotificationRepository,
    NotificationReadService,
    NotificationWriteService,
    NotificationResolver,
    NotificationListener,
  ],
  exports: [NotificationReadService, NotificationWriteService],
})
export class NotificationsModule {}
