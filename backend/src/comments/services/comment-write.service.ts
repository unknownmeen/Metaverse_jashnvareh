import { Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Comment, Role, User } from '@prisma/client';
import { CommentRepository } from '../repositories/comment.repository';
import { ImageRepository } from '../../images/repositories/image.repository';
import { AddCommentInput } from '../dto/add-comment.input';

@Injectable()
export class CommentWriteService {
  constructor(
    private readonly commentRepository: CommentRepository,
    private readonly imageRepository: ImageRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async addComment(user: User, input: AddCommentInput): Promise<Comment> {
    const image = await this.imageRepository.findById(input.imageId);
    if (!image) {
      throw new NotFoundException('تصویر یافت نشد');
    }

    const comment = await this.commentRepository.create({
      text: input.text,
      isAdminReview: false,
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

    const comment = await this.commentRepository.create({
      text: input.text,
      isAdminReview: true,
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
}
