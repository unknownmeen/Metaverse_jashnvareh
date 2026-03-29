// ─── Enums (matching backend GraphQL schema) ─────────────────

export type UserRole =
  | "SUPER_ADMIN"
  | "ADMIN"
  | "JUDGE"
  | "JUDGE_LEVEL_1"
  | "JUDGE_LEVEL_2"
  | "JUDGE_LEVEL_3"
  | "USER";
export type Gender = "MALE" | "FEMALE";
export type FestivalStatus = "UNOPENED" | "OPEN" | "CLOSED";
export type ConceptMediaType = "IMAGE" | "VIDEO";
export type NotificationType = "COMMENT" | "RATING" | "SYSTEM" | "TOP_IMAGE";

// ─── Models ──────────────────────────────────────────────────

export interface User {
  id: string;
  phone: string;
  role: UserRole;
  judgeLevel?: number | null;
  gender: Gender;
  realName?: string | null;
  displayName?: string | null;
  avatarUrl?: string | null;
  visibleName?: string | null;
  createdAt: string;
}

export interface Festival {
  id: string;
  slug: string;
  name: string;
  creatorId?: string | null;
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
  slug: string;
  url: string;
  galleryUrls: string[];
  title?: string | null;
  description?: string | null;
  isTopImage: boolean;
  tags: string[];
  festivalId: string;
  userId: string;
  author: User;
  festival?: { id: string; slug: string; name: string; creatorId?: string | null } | null;
  averageRating?: number | null;
  judgeAverageRating?: number | null;
  commentCount: number;
  judgeRatingCount: number;
  createdAt: string;
}

export interface Comment {
  id: string;
  text: string;
  isAdminReview: boolean;
  isJudgeReview: boolean;
  ratingScore?: number | null;
  ratingMaxScore?: number | null;
  imageId: string;
  userId: string;
  parentCommentId?: string | null;
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
  imageId?: string | null;
  imageSlug?: string | null;
  festivalId?: string | null;
  festivalSlug?: string | null;
  createdAt: string;
}

export interface AverageRating {
  average: number;
  count: number;
}

export interface Release {
  id: string;
  version: string;
  published: boolean;
  publishedAt?: string | null;
  features: string[];
  improvements: string[];
  bugFixes: string[];
  createdAt: string;
  updatedAt: string;
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
