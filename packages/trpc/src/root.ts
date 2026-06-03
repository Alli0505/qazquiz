import { createTRPCRouter } from "./trpc";
import { leaderboardRouter } from "./routers/leaderboard";
import { quizRouter } from "./routers/quiz";

export const appRouter = createTRPCRouter({
  quiz: quizRouter,
  leaderboard: leaderboardRouter,
});

export type AppRouter = typeof appRouter;
