import { createTRPCRouter, publicProcedure } from "./trpc";

/**
 * tRPC app router. Domain data (questions, etc.) now lives behind the Kotlin
 * backend, so this is intentionally minimal — a health probe for now. Add
 * procedures here that proxy to the backend API as the web app needs them.
 */
export const appRouter = createTRPCRouter({
  health: publicProcedure.query(() => ({ ok: true, ts: Date.now() })),
});

export type AppRouter = typeof appRouter;
