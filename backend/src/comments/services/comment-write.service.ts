import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Comment, RatingCategory, Role, User } from '@prisma/client';
import { CommentRepository } from '../repositories/comment.repository';
import { ImageRepository } from '../../images/repositories/image.repository';
import { AddCommentInput } from '../dto/add-comment.input';
import { ReplyToCommentInput } from '../dto/reply-to-comment.input';
import { UpdateCommentInput } from '../dto/update-comment.input';
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

  async addOwnerReply(user: User, input: ReplyToCommentInput): Promise<Comment> {
    const image = await this.imageRepository.findById(input.imageId);
    if (!image) {
      throw new NotFoundException('تصویر یافت نشد');
    }
    if (image.userId !== user.id) {
      throw new ForbiddenException('فقط صاحب اثر می‌تواند به نظرات پاسخ دهد');
    }

    const parent = await this.commentRepository.findById(input.parentCommentId);
    if (!parent || parent.imageId !== input.imageId) {
      throw new NotFoundException('نظر یافت نشد');
    }
    if (parent.parentCommentId != null) {
      throw new BadRequestException('فقط می‌توانید به نظرات اصلی پاسخ دهید');
    }
    if (parent.userId === user.id) {
      throw new ForbiddenException('نمی‌توانید به نظر خودتان پاسخ دهید');
    }

    const trimmed = input.text.trim();
    if (trimmed.length < 5) {
      throw new BadRequestException('متن پاسخ باید حداقل ۵ کاراکتر باشد');
    }

    const comment = await this.commentRepository.create({
      text: trimmed,
      isAdminReview: false,
      isJudgeReview: false,
      ratingScore: null,
      ratingMaxScore: null,
      image: { connect: { id: input.imageId } },
      user: { connect: { id: user.id } },
      parentComment: { connect: { id: input.parentCommentId } },
    });

    this.eventEmitter.emit('OWNER_REPLY_ADDED', {
      imageId: image.id,
      parentAuthorId: parent.userId,
      replierId: user.id,
    });

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

  async updateComment(user: User, input: UpdateCommentInput): Promise<Comment> {
    const comment = await this.commentRepository.findById(input.commentId);
    if (!comment) {
      throw new NotFoundException('پیام یافت نشد');
    }

    if (comment.userId !== user.id) {
      throw new ForbiddenException('فقط نویسنده می‌تواند این نظر را ویرایش کند');
    }

    const trimmed = input.text.trim();
    if (trimmed.length < 5) {
      throw new BadRequestException('متن نظر باید حداقل ۵ کاراکتر باشد');
    }

    const maxScore = comment.ratingMaxScore ?? 5;
    const hadRating = comment.ratingMaxScore != null || comment.ratingScore != null;

    if (input.ratingScore != null && input.ratingScore !== undefined) {
      if (!hadRating) {
        throw new BadRequestException('این نظر امتیازی ندارد');
      }
      if (input.ratingScore < 1 || input.ratingScore > maxScore) {
        throw new BadRequestException(`امتیاز باید بین ۱ و ${maxScore} باشد`);
      }
      const category = comment.isJudgeReview ? RatingCategory.JUDGE : RatingCategory.USER;
      await this.ratingRepository.upsert(
        comment.imageId,
        comment.userId,
        input.ratingScore,
        maxScore,
        category,
      );
      return this.commentRepository.update(comment.id, {
        text: trimmed,
        ratingScore: input.ratingScore,
      });
    }

    return this.commentRepository.update(comment.id, { text: trimmed });
  }

  async deleteComment(user: User, commentId: string): Promise<Comment> {
    const comment = await this.commentRepository.findById(commentId);
    if (!comment) {
      throw new NotFoundException('پیام یافت نشد');
    }

    const isPlatformAdmin = user.role === Role.ADMIN || user.role === Role.SUPER_ADMIN;
    if (comment.userId !== user.id && !isPlatformAdmin) {
      throw new ForbiddenException('فقط نویسندهٔ این نظر یا مدیر می‌تواند آن را حذف کند');
    }

    return this.commentRepository.delete(commentId);
  }

  private async getRatingSnapshot(imageId: string, userId: string, category: RatingCategory) {
    return this.ratingRepository.findByImageAndUser(imageId, userId, category);
  }
}
