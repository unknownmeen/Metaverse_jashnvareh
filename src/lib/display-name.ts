import type { User } from "@/types/models";

export function getVisibleName(viewer: User, target: User): string {
  if (viewer.id === target.id && target.gender === "female") {
    return target.displayName ?? target.realName;
  }

  if (viewer.gender === "female") {
    return target.realName;
  }

  if (target.gender === "female") {
    return target.displayName ?? target.realName;
  }

  return target.realName;
}

export function getOwnProfileName(user: User): string {
  if (user.gender === "female") {
    return user.displayName ?? user.realName;
  }

  return user.realName;
}
