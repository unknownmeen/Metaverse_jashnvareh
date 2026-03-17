import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Comment, RatingCategory, Role, User } from '@prisma/client';
import { CommentRepository } from '../repositories/comment.repository';
import { ImageRepository } from '../../images/repositories/image.repository';
import { AddCommentInput } from '../dto/add-comment.input';
import { isJudgeRole } from '../../common/utils/role.util';
import { RatingRepository } from '../../ratings/repositories/rating.repository';

@Injectable()
export class CommentWriteService {
  constructor(
    private readonly commentRepository: CommentRepository,
    private readonly imageRepository: ImageRepository,
    private readonly ratingRepository: RatingRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async addComment(user: User, input: AddCommentInput): Promise<Comment> {
    if (isJudgeRole(user.role)) {
      throw new ForbiddenException('داوران باید از بخش نقد داوری نظر خود را ثبت کنند');
    }

    const image = await this.imageRepository.findById(input.imageId);
    if (!image) {
      throw new NotFoundException('تصویر یافت نشد');
    }
    if (image.userId === user.id) {
      throw new ForbiddenException('کاربر نمی‌تواند روی اثر خودش نظر بگذارد');
    }

    const rating = await this.getRatingSnapshot(input.imageId, user.id, RatingCategory.USER);
    const comment = await this.commentRepository.create({
      text: input.text,
      isAdminReview: false,
      ratingScore: rating?.score ?? null,
      ratingMaxScore: rating?.maxScore ?? null,
      image: { connect: { id: input.imageId } },
      user: { connect: { id: user.id } },
    });

    // Emit event to notify image owner
    if (image.userId !== user.id) {
      this.eventEmitter.emit('COMMENT_ADDED', {
        imageId: image.id,
        imageOwnerId: image.userId,
        commenterId: user.id,
        commenterName: user.realName,
      });
    }

    return comment;
  }

  async addAdminReview(user: User, input: AddCommentInput): Promise<Comment> {
    const image = await this.imageRepository.findById(input.imageId);
    if (!image) {
      throw new NotFoundException('تصویر یافت نشد');
    }
    if (image.userId === user.id) {
      throw new ForbiddenException('کاربر نمی‌تواند روی اثر خودش نظر بگذارد');
    }

    const rating = await this.getRatingSnapshot(input.imageId, user.id, RatingCategory.USER);
    const comment = await this.commentRepository.create({
      text: input.text,
      isAdminReview: true,
      ratingScore: rating?.score ?? null,
      ratingMaxScore: rating?.maxScore ?? null,
      image: { connect: { id: input.imageId } },
      user: { connect: { id: user.id } },
    });

    // Emit event to notify image owner about admin review
    if (image.userId !== user.id) {
      this.eventEmitter.emit('ADMIN_REVIEW_ADDED', {
        imageId: image.id,
        imageOwnerId: image.userId,
        reviewerId: user.id,
      });
    }

    return comment;
  }

  async addJudgeReview(user: User, input: AddCommentInput): Promise<Comment> {
    if (!isJudgeRole(user.role)) {
      throw new ForbiddenException('فقط داوران می‌توانند نقد داوری ثبت کنند');
    }

    const image = await this.imageRepository.findById(input.imageId);
    if (!image) {
      throw new NotFoundException('تصویر یافت نشد');
    }
    if (image.userId === user.id) {
      throw new ForbiddenException('کاربر نمی‌تواند روی اثر خودش نظر بگذارد');
    }

    const rating = await this.getRatingSnapshot(input.imageId, user.id, RatingCategory.JUDGE);
    const comment = await this.commentRepository.create({
      text: input.text,
      isAdminReview: false,
      isJudgeReview: true,
      ratingScore: rating?.score ?? null,
      ratingMaxScore: rating?.maxScore ?? null,
      image: { connect: { id: input.imageId } },
      user: { connect: { id: user.id } },
    });

    if (image.userId !== user.id) {
      this.eventEmitter.emit('COMMENT_ADDED', {
        imageId: image.id,
        imageOwnerId: image.userId,
        commenterId: user.id,
        commenterName: user.realName,
      });
    }

    return comment;
  }

  async deleteComment(user: User, commentId: string): Promise<Comment> {
    if (user.role !== Role.ADMIN && user.role !== Role.SUPER_ADMIN) {
      throw new ForbiddenException('فقط دبیرها می‌توانند پیام را حذف کنند');
    }

    const comment = await this.commentRepository.findById(commentId);
    if (!comment) {
      throw new NotFoundException('پیام یافت نشد');
    }

    return this.commentRepository.delete(commentId);
  }

  private async getRatingSnapshot(imageId: string, userId: string, category: RatingCategory) {
    return this.ratingRepository.findByImageAndUser(imageId, userId, category);
  }
}
