import { Module } from '@nestjs/common';
import { NotificationRepository } from './repositories/notification.repository';
import { NotificationReadService } from './services/notification-read.service';
import { NotificationWriteService } from './services/notification-write.service';
import { NotificationResolver } from './resolvers/notification.resolver';
import { NotificationListener } from './listeners/notification.listener';
import { FestivalsModule } from '../festivals/festivals.module';
import { ImagesModule } from '../images/images.module';

@Module({
  imports: [FestivalsModule, ImagesModule],
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
