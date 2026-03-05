import { Injectable } from '@nestjs/common';
import { Notification, NotificationType } from '@prisma/client';
import { NotificationRepository } from '../repositories/notification.repository';

@Injectable()
export class NotificationWriteService {
  constructor(private readonly notificationRepository: NotificationRepository) {}

  async create(data: {
    type: NotificationType;
    text: string;
    userId: string;
    senderId?: string;
  }): Promise<Notification> {
    return this.notificationRepository.create(data);
  }

  async markAsRead(notificationId: string): Promise<Notification> {
    return this.notificationRepository.markAsRead(notificationId);
  }

  async markAllAsRead(userId: string): Promise<number> {
    const result = await this.notificationRepository.markAllAsRead(userId);
    return result.count;
  }
}
