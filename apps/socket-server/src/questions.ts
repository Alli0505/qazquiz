import type { Difficulty, LocalizedString, Question } from "@qazquiz/types";

/**
 * Questions come exclusively from the Kotlin backend (which owns Postgres).
 * There is no local question data and no DB access in the Node side.
 */
const QUESTIONS_API_URL =
  process.env.QUESTIONS_API_URL ?? "http://localhost:8080";

export const QUESTIONS_PER_GAME = 10;

// The API serves standalone bank questions (no quiz); the game model still
// expects a quizId, so we stamp a fixed placeholder.
const BANK_QUIZ_ID = "00000000-0000-0000-0000-000000000001";

interface ApiQuestion {
  id: string;
  difficulty: string;
  prompt: LocalizedString;
  choices: LocalizedString[];
  correctIndex: number;
  icon: string | null;
  timeLimit: number;
  points: number;
}

/**
 * Fetch a random set of questions for a difficulty from the backend API.
 * Throws if the API is unreachable or returns nothing — callers decide how
 * to surface that to the host (there is no local fallback).
 */
export async function loadQuestions(
  difficulty: Difficulty = "easy",
  count = QUESTIONS_PER_GAME,
): Promise<Question[]> {
  const url = `${QUESTIONS_API_URL}/api/v1/questions/random?difficulty=${difficulty}&count=${count}`;

  let res: Response;
  try {
    res = await fetch(url, { signal: AbortSignal.timeout(5000) });
  } catch (err) {
    throw new Error(
      `Questions API unreachable at ${QUESTIONS_API_URL}: ${(err as Error).message}`,
    );
  }

  if (!res.ok) {
    throw new Error(`Questions API responded ${res.status}`);
  }

  const data = (await res.json()) as ApiQuestion[];
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error(`Questions API returned no ${difficulty} questions`);
  }

  return data.map((q) => ({
    id: q.id,
    quizId: BANK_QUIZ_ID,
    prompt: q.prompt,
    choices: q.choices,
    correctIndex: q.correctIndex,
    timeLimit: q.timeLimit,
    points: q.points,
    icon: q.icon ?? undefined,
  }));
}
