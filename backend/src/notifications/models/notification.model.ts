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

  @Field()
  createdAt: Date;
}
