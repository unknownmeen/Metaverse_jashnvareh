ALTER TABLE "users"
ADD COLUMN "judgeLevel" INTEGER;

UPDATE "users"
SET "judgeLevel" = CASE
  WHEN "role" = 'JUDGE_LEVEL_3' THEN 3
  WHEN "role" = 'JUDGE_LEVEL_2' THEN 2
  WHEN "role" = 'JUDGE_LEVEL_1' THEN 1
  WHEN "role" = 'JUDGE' THEN 1
  ELSE NULL
END;

UPDATE "users"
SET "role" = 'JUDGE'
WHERE "role" IN ('JUDGE_LEVEL_1', 'JUDGE_LEVEL_2', 'JUDGE_LEVEL_3');

UPDATE "ratings"
SET
  "score" = LEAST(5, GREATEST(1, ROUND(("score"::numeric * 5) / NULLIF("maxScore", 0))::integer)),
  "maxScore" = 5
WHERE "category" = 'JUDGE'
  AND "maxScore" <> 5;

ALTER TABLE "users"
ADD CONSTRAINT "users_judge_level_range_chk"
CHECK ("judgeLevel" IS NULL OR ("judgeLevel" >= 1 AND "judgeLevel" <= 10));
