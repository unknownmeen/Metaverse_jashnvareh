// ─── Enums (matching backend GraphQL schema) ─────────────────

export type UserRole = "SUPER_ADMIN" | "ADMIN" | "JUDGE" | "USER";
export type Gender = "MALE" | "FEMALE";
export type FestivalStatus = "UNOPENED" | "OPEN" | "CLOSED";
export type ConceptMediaType = "IMAGE" | "VIDEO";
export type NotificationType = "COMMENT" | "RATING" | "SYSTEM" | "TOP_IMAGE";

// ─── Models ──────────────────────────────────────────────────

export interface User {
  id: string;
  phone: string;
  role: UserRole;
  gender: Gender;
  realName?: string | null;
  displayName?: string | null;
  avatarUrl?: string | null;
  visibleName?: string | null;
  createdAt: string;
}

export interface Festival {
  id: string;
  name: string;
  coverImageUrl?: string | null;
  conceptMediaType: ConceptMediaType;
  conceptMediaUrl?: string | null;
  conceptText?: string | null;
  rulesText?: string | null;
  status: FestivalStatus;
  imageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ImageItem {
  id: string;
  url: string;
  title?: string | null;
  isTopImage: boolean;
  tags: string[];
  festivalId: string;
  userId: string;
  author: User;
  averageRating?: number | null;
  commentCount: number;
  createdAt: string;
}

export interface Comment {
  id: string;
  text: string;
  isAdminReview: boolean;
  imageId: string;
  userId: string;
  author: User;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  type: NotificationType;
  text: string;
  isRead: boolean;
  userId: string;
  senderId?: string | null;
  createdAt: string;
}

export interface AverageRating {
  average: number;
  count: number;
}

// ─── Input Types ─────────────────────────────────────────────

export interface CreateFestivalInput {
  name: string;
  coverImageUrl?: string;
  conceptMediaType?: ConceptMediaType;
  conceptMediaUrl?: string;
  conceptText?: string;
  rulesText?: string;
}

// ─── Legacy compat aliases ───────────────────────────────────

export type Stream = Festival;
export type StreamStatus = FestivalStatus;
