import type { User } from "@/types/models";

/**
 * The backend GraphQL resolver already computes `visibleName`
 * based on the viewer's gender. Frontend blindly renders it.
 */
export function getVisibleName(_viewer: User, target: User): string {
  return target.visibleName ?? target.realName;
}

export function getOwnProfileName(user: User): string {
  return user.visibleName ?? user.displayName ?? user.realName;
}
