import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationType } from '@prisma/client';
import { NotificationRepository } from '../repositories/notification.repository';
import { ImageTopSelectedEvent } from '../../images/events/image-top-selected.event';

/**
 * Event Listener — Pub/Sub pattern.
 *
 * Listens to domain events and creates notifications.
 * This keeps Notification logic fully decoupled from the
 * Image/Comment/Rating services.
 */
@Injectable()
export class NotificationListener {
  constructor(private readonly notificationRepository: NotificationRepository) {}

  /**
   * When an admin selects an image as "Top",
   * notify the image owner.
   */
  @OnEvent('IMAGE_TOP_SELECTED')
  async handleImageTopSelected(event: ImageTopSelectedEvent) {
    await this.notificationRepository.create({
      type: NotificationType.TOP_IMAGE,
      text: `تصویر شما «${event.imageTitle}» به عنوان منتخب ادمین انتخاب شد.`,
      userId: event.imageOwnerId,
    });
  }

  /**
   * When a user adds a comment to an image,
   * notify the image owner.
   */
  @OnEvent('COMMENT_ADDED')
  async handleCommentAdded(payload: {
    imageId: string;
    imageOwnerId: string;
    commenterId: string;
    commenterName: string;
  }) {
    await this.notificationRepository.create({
      type: NotificationType.COMMENT,
      text: `برای تصویر شما یک نظر جدید ثبت شد.`,
      userId: payload.imageOwnerId,
      senderId: payload.commenterId,
    });
  }

  /**
   * When a user rates an image, notify the owner.
   */
  @OnEvent('RATING_ADDED')
  async handleRatingAdded(payload: {
    imageId: string;
    imageOwnerId: string;
    raterId: string;
    score: number;
  }) {
    await this.notificationRepository.create({
      type: NotificationType.RATING,
      text: `برای تصویر شما امتیاز ${payload.score} از ۵ ثبت شد.`,
      userId: payload.imageOwnerId,
      senderId: payload.raterId,
    });
  }

  /**
   * When an admin posts a review (pinned comment), notify the owner.
   */
  @OnEvent('ADMIN_REVIEW_ADDED')
  async handleAdminReview(payload: {
    imageId: string;
    imageOwnerId: string;
    reviewerId: string;
  }) {
    await this.notificationRepository.create({
      type: NotificationType.SYSTEM,
      text: `نقد جدیدی توسط ادمین برای تصویر شما ثبت شد.`,
      userId: payload.imageOwnerId,
      senderId: payload.reviewerId,
    });
  }
}
