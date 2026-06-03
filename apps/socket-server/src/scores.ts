/**
 * Live score store. Uses Redis sorted sets when REDIS_TCP_URL is set
 * (production / multi-instance), otherwise an in-memory map so the MVP
 * runs with zero external services.
 */
import type { Redis } from "ioredis";

const liveKey = (gameCode: string) => `game:${gameCode}:scores`;

interface ScoreStore {
  bump(gameCode: string, playerId: string, delta: number): Promise<number>;
  clear(gameCode: string): Promise<void>;
}

class MemoryScoreStore implements ScoreStore {
  private games = new Map<string, Map<string, number>>();

  async bump(gameCode: string, playerId: string, delta: number) {
    const game = this.games.get(gameCode) ?? new Map<string, number>();
    const total = (game.get(playerId) ?? 0) + delta;
    game.set(playerId, total);
    this.games.set(gameCode, game);
    return total;
  }

  async clear(gameCode: string) {
    this.games.delete(gameCode);
  }
}

class RedisScoreStore implements ScoreStore {
  constructor(private redis: Redis) {}

  async bump(gameCode: string, playerId: string, delta: number) {
    return Number(await this.redis.zincrby(liveKey(gameCode), delta, playerId));
  }

  async clear(gameCode: string) {
    await this.redis.del(liveKey(gameCode));
  }
}

let store: ScoreStore | null = null;

export function getScoreStore(): ScoreStore {
  if (store) return store;

  const url = process.env.REDIS_TCP_URL;
  if (url) {
    // Lazy import so ioredis never connects in the in-memory path.
    const { Redis } = require("ioredis") as typeof import("ioredis");
    const redis = new Redis(url, { maxRetriesPerRequest: null });
    store = new RedisScoreStore(redis);
    console.log("⚡ scores: Redis sorted sets");
  } else {
    store = new MemoryScoreStore();
    console.log("⚡ scores: in-memory (set REDIS_TCP_URL for Redis)");
  }
  return store;
}
