# QazQuiz

Real-time multiplayer quiz platform. Turborepo monorepo with full end-to-end
type safety from the Postgres schema to the React component.

## Structure

```
qazquiz/
├── apps/
│   ├── web/              Next.js 15 (App Router, React 19, Tailwind v4)
│   └── socket-server/    Hono + Socket.io + XState game engine
├── packages/
│   ├── db/               Drizzle schema + Neon client + migrations
│   ├── trpc/             Shared tRPC v11 routers + context
│   ├── ui/               Shared component library (Tailwind v4)
│   └── types/            Shared domain types + Zod schemas + scoring
```

## Stack

| Layer        | Tech                                                        |
| ------------ | ----------------------------------------------------------- |
| Frontend     | Next.js 15, React 19, Tailwind v4, Framer Motion, Zustand   |
| Data fetching| TanStack Query v5 + tRPC v11                                 |
| API          | tRPC v11, Zod, Better Auth                                  |
| Real-time    | Socket.io v4 (+ Redis adapter), XState v5 FSM, Hono         |
| Database     | Neon (serverless Postgres) + Drizzle ORM                    |
| Cache/scores | Redis sorted sets (live leaderboards)                       |
| Hosting      | Vercel (web) · Railway (socket-server)                      |

## Architecture notes

- **Live scoring is server-authoritative.** Answers hit the socket server,
  scores are computed there (`computeScore` in `@qazquiz/types`), written to
  Redis sorted sets for instant `ZREVRANGE` leaderboards, then flushed to
  Postgres on `game:over`.
- **The game lifecycle is an XState machine**, not buried `if/else`:
  `LOBBY → STARTING → QUESTION_ACTIVE → ANSWER_REVEAL → (loop | GAME_OVER)`.
  See `apps/socket-server/src/game-machine.ts`.
- **Why two hosts?** Vercel kills WebSocket connections (stateless functions),
  so the socket server runs as a persistent process on Railway. The Redis
  adapter lets you scale it horizontally later.

## Run the MVP (zero config)

The MVP runs with **no database and no Redis** — the socket server keeps
game state and live scores in memory, with a preloaded demo quiz.

```bash
pnpm install
pnpm dev          # web → http://localhost:3000, socket-server → :3001
```

Then open two browser tabs:

1. **Tab 1 — host:** http://localhost:3000/host → enter a name → get a
   5-letter code → wait for players → **Start game**.
2. **Tab 2 — player:** http://localhost:3000/play → enter the code + a name.

Answer the questions; scores are time-weighted (faster = more points) and the
leaderboard animates between rounds. Add more tabs for more players.

> First time only: `brew install node && npm i -g pnpm@9` to get the toolchain.

## Going to production (Neon + Redis)

```bash
cp .env.example .env                 # fill in Neon + Redis + auth secrets
pnpm db:generate && pnpm db:migrate  # push the Drizzle schema to Neon
export REDIS_TCP_URL=redis://…       # socket-server switches to Redis sorted sets
pnpm dev
```

Remaining wiring for prod (marked with `TODO` in the code): Better Auth session
resolution (`apps/web/src/lib/auth.ts`), loading a host's real quiz from Postgres
instead of the demo bank, and flushing final scores to Postgres on `game:over`.

## Scripts

| Command            | What it does                                  |
| ------------------ | --------------------------------------------- |
| `pnpm dev`         | Run web + socket-server in parallel (Turbo)   |
| `pnpm build`       | Build all apps/packages                       |
| `pnpm typecheck`   | Type-check the whole workspace                |
| `pnpm db:studio`   | Open Drizzle Studio                           |
| `pnpm db:migrate`  | Apply migrations to Neon                      |
