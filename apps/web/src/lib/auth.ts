import type { Session } from "@qazquiz/trpc";

/**
 * Better Auth integration point.
 *
 * Wire this to `betterAuth({ database: drizzleAdapter(db, ...) })` and
 * resolve the session from the request headers/cookies. Stubbed to keep
 * the scaffold runnable before auth is configured.
 */
export async function getSession(_headers: Headers): Promise<Session | null> {
  return null;
}
