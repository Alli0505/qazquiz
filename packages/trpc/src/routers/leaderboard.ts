import { desc, eq } from "drizzle-orm";
import { z } from "zod";

import { gameResults, games } from "@qazquiz/db";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const leaderboardRouter = createTRPCRouter({
  /** Persisted, global all-time leaderboard (Postgres). */
  global: publicProcedure
    .input(z.object({ limit: z.number().int().min(1).max(100).default(20) }))
    .query(async ({ ctx, input }) => {
      return ctx.db
        .select({
          displayName: gameResults.displayName,
          score: gameResults.finalScore,
        })
        .from(gameResults)
        .orderBy(desc(gameResults.finalScore))
        .limit(input.limit);
    }),

  /** Final results for one completed game. */
  forGame: publicProcedure
    .input(z.object({ gameId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      return ctx.db
        .select()
        .from(gameResults)
        .where(eq(gameResults.gameId, input.gameId))
        .orderBy(gameResults.rank);
    }),
});
