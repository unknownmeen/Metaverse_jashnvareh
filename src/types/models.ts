export type UserRole = "admin" | "judge" | "regular";

export type Gender = "male" | "female";

export type StreamStatus = "opened" | "finished" | "not_opened";

export type ConceptMediaType = "image" | "video";

export interface User {
  id: string;
  role: UserRole;
  gender: Gender;
  realName: string;
  displayName?: string;
  phone: string;
  password: string;
  avatarUrl: string;
}

export interface Stream {
  id: string;
  name: string;
  coverUrl: string;
  status: StreamStatus;
  conceptMediaType: ConceptMediaType;
  conceptMediaUrl?: string;
  conceptDescription: string;
  formRules: string;
}

export interface ImageItem {
  id: string;
  streamId: string;
  ownerId: string;
  title: string;
  url: string;
  createdAt: string;
  tags: string[];
  isFeatured: boolean;
}

export interface Comment {
  id: string;
  imageId: string;
  userId: string;
  rating: number;
  text: string;
  createdAt: string;
  isCritique?: boolean;
}

export interface NotificationItem {
  id: string;
  text: string;
  createdAt: string;
  icon: "comment" | "rating" | "system";
  avatarUrl?: string;
  read: boolean;
  /** کاربری که این اعلان برای اوست؛ اگر خالی باشد برای همه */
  targetUserId?: string;
  /** برای ناوبری به صفحه تصویر */
  imageId?: string;
  /** برای ناوبری به صفحه جریان */
  streamId?: string;
}

export interface StreamInput {
  name: string;
  coverUrl: string;
  conceptMediaType: ConceptMediaType;
  conceptMediaUrl?: string;
  conceptDescription: string;
  formRules: string;
  status: StreamStatus;
}
