import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  smallint,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

type LocalizedString = Record<string, string>;

export const difficultyEnum = pgEnum("difficulty", ["easy", "medium", "hard"]);

// ── Auth (Better Auth core tables) ────────────────────────────────────
// Better Auth manages migrations for these, but we declare them so app
// queries are typed. Keep column names aligned with Better Auth defaults.

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ── Quiz content ──────────────────────────────────────────────────────

export const quizzes = pgTable("quizzes", {
  id: uuid("id").defaultRandom().primaryKey(),
  ownerId: text("owner_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  title: text("title").notNull(),
  description: text("description"),
  category: text("category"),
  isPublished: boolean("is_published").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const questions = pgTable(
  "questions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    /** NULL = standalone bank question; set = belongs to an authored quiz */
    quizId: uuid("quiz_id").references(() => quizzes.id, {
      onDelete: "cascade",
    }),
    difficulty: difficultyEnum("difficulty").default("easy").notNull(),
    category: text("category"),
    /** only meaningful within an authored quiz */
    order: integer("order"),
    // localized content: { en, kz, … }
    prompt: jsonb("prompt").$type<LocalizedString>().notNull(),
    choices: jsonb("choices").$type<LocalizedString[]>().notNull(),
    correctIndex: smallint("correct_index").notNull(),
    /** optional localized "why this answer is correct" */
    explanation: jsonb("explanation").$type<LocalizedString>(),
    timeLimit: integer("time_limit").default(15).notNull(),
    points: integer("points").default(100).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({
    byQuiz: index("questions_quiz_idx").on(t.quizId),
    // fast random draw of active bank questions per difficulty
    byDifficulty: index("questions_difficulty_idx").on(
      t.difficulty,
      t.isActive,
    ),
  }),
);

// ── Game sessions (historical record; live state lives in Redis) ──────

export const games = pgTable(
  "games",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    /** NULL for a bank-mode game (uses `difficulty` instead of a quiz) */
    quizId: uuid("quiz_id").references(() => quizzes.id, {
      onDelete: "restrict",
    }),
    /** set for bank-mode games */
    difficulty: difficultyEnum("difficulty"),
    hostId: text("host_id").references(() => users.id, {
      onDelete: "set null",
    }),
    code: text("code").notNull().unique(), // join code, e.g. "QAZ-7F3K"
    startedAt: timestamp("started_at"),
    endedAt: timestamp("ended_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({
    byCode: index("games_code_idx").on(t.code),
  }),
);

export const gameResults = pgTable(
  "game_results",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    gameId: uuid("game_id")
      .references(() => games.id, { onDelete: "cascade" })
      .notNull(),
    /** nullable: guests play without an account */
    userId: text("user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    displayName: text("display_name").notNull(),
    finalScore: integer("final_score").notNull(),
    rank: integer("rank").notNull(),
  },
  (t) => ({
    byGame: index("game_results_game_idx").on(t.gameId),
  }),
);

// ── Relations ─────────────────────────────────────────────────────────

export const quizzesRelations = relations(quizzes, ({ one, many }) => ({
  owner: one(users, { fields: [quizzes.ownerId], references: [users.id] }),
  questions: many(questions),
}));

export const questionsRelations = relations(questions, ({ one }) => ({
  quiz: one(quizzes, { fields: [questions.quizId], references: [quizzes.id] }),
}));

export const gamesRelations = relations(games, ({ one, many }) => ({
  quiz: one(quizzes, { fields: [games.quizId], references: [quizzes.id] }),
  results: many(gameResults),
}));

export const gameResultsRelations = relations(gameResults, ({ one }) => ({
  game: one(games, { fields: [gameResults.gameId], references: [games.id] }),
}));
