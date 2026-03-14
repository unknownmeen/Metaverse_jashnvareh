import { Field, ID, ObjectType } from '@nestjs/graphql';
import { NotificationType } from '../../common/enums';

@ObjectType('Notification')
export class NotificationModel {
  @Field(() => ID)
  id: string;

  @Field(() => NotificationType)
  type: NotificationType;

  @Field()
  text: string;

  @Field()
  isRead: boolean;

  @Field()
  userId: string;

  @Field({ nullable: true })
  senderId?: string;

  @Field({ nullable: true })
  imageId?: string;

  @Field({ nullable: true, description: 'Slug تصویر برای لینک فارسی' })
  imageSlug?: string;

  @Field({ nullable: true })
  festivalId?: string;

  @Field({ nullable: true, description: 'Slug جریان برای لینک فارسی' })
  festivalSlug?: string;

  @Field()
  createdAt: Date;
}
