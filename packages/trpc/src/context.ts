/**
 * Per-request context. The database now lives behind the Kotlin backend —
 * tRPC no longer holds a DB client. Add a typed API client here if/when the
 * web app needs to call the backend through tRPC.
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
    session: opts.session,
    headers: opts.headers,
  };
}

export type Context = ReturnType<typeof createTRPCContext>;
