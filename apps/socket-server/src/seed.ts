/**
 * Seed the Postgres question bank from the in-code banks.
 *
 *   pnpm --filter @qazquiz/socket-server db:seed
 *
 * Idempotent: clears existing standalone bank questions (quiz_id IS NULL)
 * and re-inserts. Authored-quiz questions (quiz_id set) are left untouched.
 */
import { client, db, questions } from "@qazquiz/db";
import type { Difficulty } from "@qazquiz/types";
import { isNull } from "drizzle-orm";

import {
  DEFAULT_TIME_LIMIT,
  EASY_BANK,
  HARD_BANK,
  MEDIUM_BANK,
} from "./questions";

async function seed() {
  const banks: Array<{ difficulty: Difficulty; bank: typeof EASY_BANK }> = [
    { difficulty: "easy", bank: EASY_BANK },
    { difficulty: "medium", bank: MEDIUM_BANK },
    { difficulty: "hard", bank: HARD_BANK },
  ];

  const rows = banks.flatMap(({ difficulty, bank }) =>
    bank.map((q) => ({
      quizId: null,
      difficulty,
      category: null,
      order: null,
      prompt: q.prompt,
      choices: q.choices,
      correctIndex: q.correctIndex,
      icon: q.icon ?? null,
      timeLimit: q.timeLimit ?? DEFAULT_TIME_LIMIT[difficulty],
      points: q.points ?? 100,
    })),
  );

  // wipe existing bank questions for a clean, repeatable seed
  await db.delete(questions).where(isNull(questions.quizId));
  await db.insert(questions).values(rows);

  console.log(
    `✅ Seeded ${rows.length} bank questions ` +
      `(${EASY_BANK.length} easy, ${MEDIUM_BANK.length} medium, ${HARD_BANK.length} hard)`,
  );
  await client.end();
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
