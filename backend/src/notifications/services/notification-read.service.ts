import { Injectable } from '@nestjs/common';
import { Notification } from '@prisma/client';
import { NotificationRepository } from '../repositories/notification.repository';

@Injectable()
export class NotificationReadService {
  constructor(private readonly notificationRepository: NotificationRepository) {}

  async findByUserId(userId: string): Promise<Notification[]> {
    return this.notificationRepository.findByUserId(userId);
  }
}
