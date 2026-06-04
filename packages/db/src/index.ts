import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";

/**
 * Standard TCP Postgres via postgres.js — works against local Docker
 * Postgres in dev and Neon (pooled connection string) in production.
 *
 * The client is lazy: it doesn't open a socket until the first query, so
 * importing this module never throws even when no DB is reachable. Callers
 * that want a graceful fallback (e.g. the socket server) should catch
 * query errors. `hasDatabaseUrl` lets callers skip the DB entirely.
 */
export const DATABASE_URL =
  process.env.DATABASE_URL ?? "postgres://qazquiz:qazquiz@localhost:5432/qazquiz";

export const hasDatabaseUrl = Boolean(process.env.DATABASE_URL);

// One shared client. `max` kept modest for the persistent socket server.
const client = postgres(DATABASE_URL, { max: 10 });

export const db = drizzle(client, { schema });

export { client, schema };
export * from "./schema";
export type DB = typeof db;
