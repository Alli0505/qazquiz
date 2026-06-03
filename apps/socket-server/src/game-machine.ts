import type { LeaderboardEntry, Player, Question } from "@qazquiz/types";
import { assign, setup } from "xstate";

/**
 * Authoritative game lifecycle:
 *
 *   LOBBY → STARTING → questionLoop( QUESTION_ACTIVE → ANSWER_REVEAL ) → GAME_OVER
 *
 * The machine owns *what phase we're in* and *which question is current*.
 * Scoring math lives in @qazquiz/types; persistence and socket emits are
 * handled by the actor's `emit`/side-effects in index.ts.
 */

export interface GameContext {
  code: string;
  hostId: string;
  questions: Question[];
  players: Map<string, Player>;
  currentIndex: number;
  /** epoch ms when the active question opened */
  questionStartedAt: number | null;
  /** answers received for the current question: playerId -> choiceIndex */
  answers: Map<string, number>;
}

export type GameEvent =
  | { type: "PLAYER_JOIN"; player: Player }
  | { type: "PLAYER_LEAVE"; playerId: string }
  | { type: "START" }
  | { type: "COUNTDOWN_DONE" }
  | { type: "ANSWER"; playerId: string; choiceIndex: number }
  | { type: "TIME_UP" }
  | { type: "NEXT" };

export const COUNTDOWN_MS = 3000;
export const REVEAL_MS = 4000;

export const gameMachine = setup({
  types: {
    context: {} as GameContext,
    events: {} as GameEvent,
    input: {} as { code: string; hostId: string; questions: Question[] },
  },
  actions: {
    recordAnswer: assign(({ context, event }) => {
      if (event.type !== "ANSWER") return {};
      const answers = new Map(context.answers);
      // first answer per player wins; ignore duplicates
      if (!answers.has(event.playerId)) {
        answers.set(event.playerId, event.choiceIndex);
      }
      return { answers };
    }),
  },
  guards: {
    hasMoreQuestions: ({ context }) =>
      context.currentIndex < context.questions.length - 1,
    allAnswered: ({ context }) =>
      context.answers.size >= context.players.size && context.players.size > 0,
  },
  delays: {
    countdown: COUNTDOWN_MS,
    reveal: REVEAL_MS,
    questionTime: ({ context }) =>
      (context.questions[context.currentIndex]?.timeLimit ?? 20) * 1000,
  },
}).createMachine({
  id: "game",
  context: ({ input }) => ({
    code: input.code,
    hostId: input.hostId,
    questions: input.questions,
    players: new Map(),
    currentIndex: -1,
    questionStartedAt: null,
    answers: new Map(),
  }),
  initial: "lobby",
  states: {
    lobby: {
      on: {
        PLAYER_JOIN: {
          actions: assign(({ context, event }) => {
            const players = new Map(context.players);
            players.set(event.player.id, event.player);
            return { players };
          }),
        },
        PLAYER_LEAVE: {
          actions: assign(({ context, event }) => {
            const players = new Map(context.players);
            players.delete(event.playerId);
            return { players };
          }),
        },
        START: { target: "starting" },
      },
    },

    starting: {
      after: { countdown: { target: "questionActive" } },
      on: { COUNTDOWN_DONE: { target: "questionActive" } },
    },

    questionActive: {
      entry: assign(({ context }) => ({
        currentIndex: context.currentIndex + 1,
        questionStartedAt: Date.now(),
        answers: new Map(),
      })),
      after: { questionTime: { target: "answerReveal" } },
      on: {
        ANSWER: [
          {
            guard: "allAnswered",
            target: "answerReveal",
            actions: "recordAnswer",
          },
          { actions: "recordAnswer" },
        ],
        TIME_UP: { target: "answerReveal" },
      },
    },

    answerReveal: {
      after: { reveal: [{ guard: "hasMoreQuestions", target: "questionActive" }, { target: "gameOver" }] },
      on: {
        NEXT: [
          { guard: "hasMoreQuestions", target: "questionActive" },
          { target: "gameOver" },
        ],
      },
    },

    gameOver: { type: "final" },
  },
});

/**
 * Helper used by the server to build a sorted leaderboard snapshot from
 * the current player map (live scores are also mirrored to Redis).
 */
export function snapshotLeaderboard(
  players: Map<string, Player>,
): LeaderboardEntry[] {
  return [...players.values()]
    .sort((a, b) => b.score - a.score)
    .map((p, i) => ({
      playerId: p.id,
      name: p.name,
      score: p.score,
      rank: i + 1,
    }));
}
