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

## Questions database (Postgres)

Questions live in Postgres (table `questions`), tagged by `difficulty`
(`easy`/`hard`) and stored as localized JSON (`{ en, kz }`). A game draws 10
at random from the matching difficulty bank. If `DATABASE_URL` is unset or the
DB is unreachable, the socket server **falls back to the in-memory bank**, so
the zero-config run above still works.

Local dev uses Docker Postgres (via [Colima](https://github.com/abiosoft/colima)
if you don't have Docker Desktop):

```bash
# one-time: a Docker engine
brew install colima docker docker-compose && colima start

docker compose up -d                 # Postgres on :5432 (see docker-compose.yml)
cp .env.example .env                 # DATABASE_URL points at local Docker

pnpm --filter @qazquiz/db db:migrate # create tables
pnpm --filter @qazquiz/socket-server db:seed   # load the 39-question bank
pnpm dev                             # socket server now reads questions from PG
```

> Colima note: the daemon socket isn't at the default path. If `docker compose`
> can't connect, prefix commands with
> `DOCKER_HOST="unix://$HOME/.colima/default/docker.sock"`.

The driver is `postgres.js` (standard TCP), which works against local Postgres
**and** Neon (use Neon's *pooled* connection string in production — see
`.env.example`).

## Questions API — Kotlin / Spring Boot (`apps/api`)

The question bank is served by a JVM backend (Kotlin + Spring Boot 3 + jOOQ),
introduced via the strangler-fig pattern — domain services move to Kotlin one
at a time; the Node real-time engine and Next.js web stay as they are.

```
socket-server ──HTTP──▶ Kotlin API (:8080) ──SQL──▶ Postgres
   (falls back to the in-memory bank if the API is down)
```

- **Endpoint:** `GET /api/v1/questions/random?difficulty=easy|medium|hard&count=10`
  → a random set of questions **with answers** (server-to-server; the web
  client never sees `correctIndex`). Swagger UI at `/swagger`, health at
  `/actuator/health`.
- **Schema ownership:** Drizzle (Node) still owns the schema + seed; the API
  is read-only on `questions` for now (no dual-migration conflict).
- **Stack:** Java 21 LTS, Gradle (wrapper), jOOQ (SQL-first), HikariCP,
  Actuator, JUnit5.

Run it (needs JDK 21 — `brew install openjdk@21`):

```bash
cd apps/api && ./gradlew bootRun        # http://localhost:8080
# the socket server calls it via QUESTIONS_API_URL (default http://localhost:8080)
```

Or via Docker: `docker compose up -d api` (builds the multi-stage image).

## Going to production (Neon + Redis)

```bash
# DATABASE_URL → Neon pooled URL, then:
pnpm --filter @qazquiz/db db:migrate
pnpm --filter @qazquiz/socket-server db:seed
export REDIS_TCP_URL=redis://…       # socket-server switches to Redis sorted sets
pnpm dev
```

Remaining wiring for prod (marked with `TODO` in the code): Better Auth session
resolution (`apps/web/src/lib/auth.ts`), authored-quiz play (questions with a
`quiz_id` instead of bank draws), and flushing final scores to Postgres on
`game:over`.

## Scripts

| Command            | What it does                                  |
| ------------------ | --------------------------------------------- |
| `pnpm dev`         | Run web + socket-server in parallel (Turbo)   |
| `pnpm build`       | Build all apps/packages                       |
| `pnpm typecheck`   | Type-check the whole workspace                |
| `pnpm db:studio`   | Open Drizzle Studio                           |
| `pnpm db:migrate`  | Apply migrations to Neon                      |
