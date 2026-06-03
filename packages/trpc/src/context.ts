import { db } from "@qazquiz/db";

/**
 * Per-request context. `createContext` is wired up by each adapter
 * (Next.js route handler, fetch handler, etc.) and passes the resolved
 * session through. Keep this adapter-agnostic.
 */
export interface Session {
  userId: string;
  email: string;
}

export interface CreateContextOptions {
  session: Session | null;
  headers: Headers;
}

export function createTRPCContext(opts: CreateContextOptions) {
  return {
    db,
    session: opts.session,
    headers: opts.headers,
  };
}

export type Context = ReturnType<typeof createTRPCContext>;
