import type { UserRole } from "@/types/models";

export function isJudgeRole(role: UserRole): boolean {
  return (
    role === "JUDGE" ||
    role === "JUDGE_LEVEL_1" ||
    role === "JUDGE_LEVEL_2" ||
    role === "JUDGE_LEVEL_3"
  );
}

export function normalizeJudgeRole(role: UserRole): UserRole {
  return isJudgeRole(role) ? "JUDGE" : role;
}

export function getJudgeMaxScore(role: UserRole): number {
  if (!isJudgeRole(role)) return 5;
  return 5;
}

export function normalizeJudgeLevel(level: number | null | undefined): number {
  if (!level) return 1;
  if (level < 1) return 1;
  if (level > 10) return 10;
  return level;
}
