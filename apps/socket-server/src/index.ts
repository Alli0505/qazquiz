import type { Server as HttpServer } from "node:http";

import { serve } from "@hono/node-server";
import {
  computeScore,
  type ClientToServerEvents,
  type Player,
  type Question,
  type ServerToClientEvents,
} from "@qazquiz/types";
import { Hono } from "hono";
import { createActor } from "xstate";
import { Server } from "socket.io";

import {
  gameMachine,
  snapshotLeaderboard,
  type GameContext,
} from "./game-machine";
import { loadQuestions } from "./questions";
import { getScoreStore } from "./scores";

const PORT = Number(process.env.SOCKET_SERVER_PORT ?? 3001);
const scores = getScoreStore();

// ── HTTP layer (health checks, future REST/webhooks) via Hono ─────────
const app = new Hono();
app.get("/health", (c) => c.json({ ok: true, ts: Date.now() }));

// Hono owns the Node http.Server; Socket.io upgrades from the same one.
const httpServer = serve({ fetch: app.fetch, port: PORT });

// ── Socket.io ─────────────────────────────────────────────────────────
const io = new Server<ClientToServerEvents, ServerToClientEvents>(
  httpServer as unknown as HttpServer,
  { cors: { origin: process.env.WEB_ORIGIN ?? "*" } },
);

// Optional horizontal scaling: enable the Redis adapter when configured.
if (process.env.REDIS_TCP_URL) {
  const { createAdapter } = await import("@socket.io/redis-adapter");
  const { Redis } = await import("ioredis");
  const pub = new Redis(process.env.REDIS_TCP_URL, {
    maxRetriesPerRequest: null,
  });
  io.adapter(createAdapter(pub, pub.duplicate()));
  console.log("⚡ socket.io: Redis adapter enabled");
}

type GameActor = ReturnType<typeof createActor<typeof gameMachine>>;

interface Game {
  actor: GameActor;
  hostSocketId: string;
}

const games = new Map<string, Game>();

function makeCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no ambiguous chars
  let code = "";
  for (let i = 0; i < 5; i++) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return games.has(code) ? makeCode() : code;
}

/** Wire an actor's state transitions to room broadcasts. */
function bindBroadcasts(code: string, actor: GameActor) {
  // The subscriber fires on every context change, not just phase changes
  // (e.g. each incoming answer). Track the previous phase so "enter once"
  // events (question:show, reveal, etc.) aren't re-broadcast mid-question.
  let prevPhase: string | null = null;

  actor.subscribe((state) => {
    const ctx = state.context as GameContext;
    const room = io.to(code);
    const phase = String(state.value);
    const entered = phase !== prevPhase;
    prevPhase = phase;

    if (state.matches("lobby")) {
      // re-emit on every change so the lobby player list stays live
      room.emit("lobby:update", {
        players: [...ctx.players.values()],
        hostId: ctx.hostId,
      });
    } else if (state.matches("starting")) {
      if (entered) room.emit("game:starting", { countdownMs: 3000 });
    } else if (state.matches("questionActive")) {
      if (!entered) return; // ignore re-fires from answer events
      const q: Question | undefined = ctx.questions[ctx.currentIndex];
      if (!q) return;
      const { correctIndex: _omit, ...publicQ } = q;
      room.emit("question:show", {
        question: publicQ,
        index: ctx.currentIndex,
        total: ctx.questions.length,
        endsAt: (ctx.questionStartedAt ?? Date.now()) + q.timeLimit * 1000,
      });
    } else if (state.matches("answerReveal")) {
      if (!entered) return;
      const q = ctx.questions[ctx.currentIndex];
      if (!q) return;
      room.emit("question:reveal", {
        correctIndex: q.correctIndex,
        leaderboard: snapshotLeaderboard(ctx.players),
      });
    } else if (state.matches("gameOver")) {
      room.emit("game:over", { leaderboard: snapshotLeaderboard(ctx.players) });
      void scores.clear(code);
      games.delete(code);
      // TODO(prod): flush final results to Postgres via a tRPC server-caller.
    }
  });
}

function createGame(code: string, hostId: string, questions: Question[]) {
  const actor = createActor(gameMachine, {
    input: { code, hostId, questions },
  });
  bindBroadcasts(code, actor);
  actor.start();
  games.set(code, { actor, hostSocketId: hostId });
  return actor;
}

io.on("connection", (socket) => {
  let joinedCode: string | null = null;

  socket.on("host:create", async ({ hostName, difficulty }, ack) => {
    const code = makeCode();
    const actor = createGame(code, socket.id, await loadQuestions(difficulty));
    joinedCode = code;
    await socket.join(code);
    actor.send({
      type: "PLAYER_JOIN",
      player: { id: socket.id, name: hostName, score: 0, connected: true },
    });
    ack({ gameCode: code });
  });

  socket.on("lobby:join", async ({ gameCode, name }, ack) => {
    const code = gameCode.toUpperCase().trim();
    const game = games.get(code);
    if (!game) {
      ack({ ok: false, error: "Game not found" });
      return;
    }
    if (!game.actor.getSnapshot().matches("lobby")) {
      ack({ ok: false, error: "Game already started" });
      return;
    }
    joinedCode = code;
    await socket.join(code);
    game.actor.send({
      type: "PLAYER_JOIN",
      player: { id: socket.id, name, score: 0, connected: true },
    });
    ack({ ok: true });
  });

  socket.on("game:start", () => {
    if (!joinedCode) return;
    const game = games.get(joinedCode);
    if (!game || game.hostSocketId !== socket.id) return; // host only
    game.actor.send({ type: "START" });
  });

  socket.on("answer:submit", async ({ questionId, choiceIndex, clientTs }) => {
    if (!joinedCode) return;
    const game = games.get(joinedCode);
    if (!game) return;
    const ctx = game.actor.getSnapshot().context as GameContext;
    const q = ctx.questions[ctx.currentIndex];
    if (!q || q.id !== questionId || ctx.answers.has(socket.id)) return;

    // Apply the score BEFORE sending ANSWER: when this is the last player,
    // ANSWER synchronously transitions to answerReveal and broadcasts the
    // leaderboard, so the points must already be reflected.
    if (choiceIndex === q.correctIndex && ctx.questionStartedAt) {
      const answeredAt = Math.max(clientTs, ctx.questionStartedAt);
      const gained = computeScore(q, answeredAt, ctx.questionStartedAt);
      const total = await scores.bump(joinedCode, socket.id, gained);
      const player: Player | undefined = ctx.players.get(socket.id);
      if (player) player.score = total;
    }

    game.actor.send({ type: "ANSWER", playerId: socket.id, choiceIndex });
  });

  socket.on("lobby:leave", () => {
    if (joinedCode) {
      games
        .get(joinedCode)
        ?.actor.send({ type: "PLAYER_LEAVE", playerId: socket.id });
    }
  });

  socket.on("disconnect", () => {
    if (joinedCode) {
      games
        .get(joinedCode)
        ?.actor.send({ type: "PLAYER_LEAVE", playerId: socket.id });
    }
  });
});

console.log(`⚡ QazQuiz socket server listening on :${PORT}`);
