import { z } from "zod";

/**
 * Shared domain types + Zod schemas for QazQuiz.
 *
 * These are the single source of truth used by:
 *  - the tRPC routers (validation)
 *  - the socket server (game FSM payloads)
 *  - the web client (typed state)
 */

// ── Core entities ─────────────────────────────────────────────────────

/**
 * Localized text: a map of locale code → string (e.g. { en, kz }).
 * Used for question prompts and answer choices so the client can render
 * content in the player's chosen language. `en` is treated as the
 * fallback when a locale is missing.
 */
export const localizedStringSchema = z.record(z.string(), z.string());
export type LocalizedString = z.infer<typeof localizedStringSchema>;

export const questionSchema = z.object({
  id: z.string().uuid(),
  quizId: z.string().uuid(),
  prompt: localizedStringSchema,
  choices: z.array(localizedStringSchema).min(2).max(4),
  correctIndex: z.number().int().min(0).max(3),
  /** seconds the question stays open */
  timeLimit: z.number().int().positive().default(20),
  /** max points awarded for an instant correct answer */
  points: z.number().int().positive().default(1000),
});
export type Question = z.infer<typeof questionSchema>;

/** Question as sent to clients — never leaks the correct answer. */
export const publicQuestionSchema = questionSchema.omit({
  correctIndex: true,
});
export type PublicQuestion = z.infer<typeof publicQuestionSchema>;

export const playerSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(24),
  avatarUrl: z.string().url().optional(),
  score: z.number().int().nonnegative().default(0),
  connected: z.boolean().default(true),
});
export type Player = z.infer<typeof playerSchema>;

export const gamePhase = z.enum([
  "LOBBY",
  "STARTING",
  "QUESTION_ACTIVE",
  "ANSWER_REVEAL",
  "GAME_OVER",
]);
export type GamePhase = z.infer<typeof gamePhase>;

// ── Socket.io event contracts ─────────────────────────────────────────
// Strongly-typed maps consumed by both client and server.

export interface ServerToClientEvents {
  "lobby:update": (payload: { players: Player[]; hostId: string }) => void;
  "game:starting": (payload: { countdownMs: number }) => void;
  "question:show": (payload: {
    question: PublicQuestion;
    index: number;
    total: number;
    endsAt: number; // epoch ms
  }) => void;
  "question:reveal": (payload: {
    correctIndex: number;
    leaderboard: LeaderboardEntry[];
  }) => void;
  "game:over": (payload: { leaderboard: LeaderboardEntry[] }) => void;
  "error": (payload: { code: string; message: string }) => void;
}

export interface ClientToServerEvents {
  /** Host opens a new room; ack returns the join code. */
  "host:create": (
    payload: { hostName: string },
    ack: (res: { gameCode: string }) => void,
  ) => void;
  "lobby:join": (
    payload: { gameCode: string; name: string },
    ack: (res: { ok: boolean; error?: string }) => void,
  ) => void;
  "game:start": () => void; // host only
  "answer:submit": (payload: {
    questionId: string;
    choiceIndex: number;
    clientTs: number;
  }) => void;
  "lobby:leave": () => void;
}

export interface LeaderboardEntry {
  playerId: string;
  name: string;
  score: number;
  rank: number;
}

// ── Scoring ───────────────────────────────────────────────────────────

/**
 * Time-weighted scoring (server-authoritative). Faster correct answers
 * earn more, never less than half the base points for a correct answer.
 */
export function computeScore(
  question: Pick<Question, "points" | "timeLimit">,
  answeredAtMs: number,
  questionStartedAtMs: number,
): number {
  const elapsed = (answeredAtMs - questionStartedAtMs) / 1000;
  const fraction = Math.max(0, 1 - elapsed / question.timeLimit);
  return Math.round(question.points * (0.5 + 0.5 * fraction));
}
