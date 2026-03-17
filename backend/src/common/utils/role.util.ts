import { Role } from '@prisma/client';

export function isJudgeRole(role: Role): boolean {
  return (
    role === Role.JUDGE ||
    role === Role.JUDGE_LEVEL_1 ||
    role === Role.JUDGE_LEVEL_2 ||
    role === Role.JUDGE_LEVEL_3
  );
}

export function getJudgeMaxScore(role: Role): number | null {
  if (!isJudgeRole(role)) return null;
  return 5;
}

export function normalizeJudgeLevel(level: number | null | undefined): number {
  if (!level) return 1;
  if (level < 1) return 1;
  if (level > 10) return 10;
  return level;
}

export function canSeeJudgeSignals(role: Role): boolean {
  return role === Role.ADMIN || role === Role.SUPER_ADMIN;
}
