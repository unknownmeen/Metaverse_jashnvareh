import { Injectable } from '@nestjs/common';
import { CommentRepository } from '../repositories/comment.repository';

@Injectable()
export class CommentReadService {
  constructor(private readonly commentRepository: CommentRepository) {}

  async findByImageId(imageId: string) {
    return this.commentRepository.findByImageId(imageId);
  }
}
