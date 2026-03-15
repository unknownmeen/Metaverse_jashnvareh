import type { UserRole } from "@/types/models";

export function isJudgeRole(role: UserRole): boolean {
  return (
    role === "JUDGE" ||
    role === "JUDGE_LEVEL_1" ||
    role === "JUDGE_LEVEL_2" ||
    role === "JUDGE_LEVEL_3"
  );
}

export function getJudgeMaxScore(role: UserRole): number {
  if (role === "JUDGE" || role === "JUDGE_LEVEL_1") return 3;
  if (role === "JUDGE_LEVEL_2") return 5;
  if (role === "JUDGE_LEVEL_3") return 7;
  return 5;
}
