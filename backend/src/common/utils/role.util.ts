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
  if (role === Role.JUDGE || role === Role.JUDGE_LEVEL_1) return 3;
  if (role === Role.JUDGE_LEVEL_2) return 5;
  if (role === Role.JUDGE_LEVEL_3) return 7;
  return null;
}
