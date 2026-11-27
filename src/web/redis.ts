import "dotenv/config";
import { Redis } from "ioredis";
import { logger } from "./logging.js";

const memoryStore = new Map<string, { value: string; expiresAt: number }>();

const redisUrl = process.env.REDIS_URL;

export const redisClient = redisUrl
  ? new Redis(redisUrl, {
      lazyConnect: true,
      maxRetriesPerRequest: 1,
      connectTimeout: 5000,
      retryStrategy(times) {
        if (times > 2) {
          return null;
        }
        return Math.min(times * 200, 1000);
      },
    })
  : null;

let redisAvailable = Boolean(redisClient);
let activeOps = 0;

const refStream = (): void => {
  activeOps++;
  const stream = (redisClient as any)?.stream;
  if (stream && typeof stream.ref === "function") {
    stream.ref();
  }
};

const unrefStream = (): void => {
  activeOps = Math.max(0, activeOps - 1);
  if (activeOps === 0) {
    const stream = (redisClient as any)?.stream;
    if (stream && typeof stream.unref === "function") {
      stream.unref();
    }
  }
};

if (redisClient) {
  redisClient.on("error", (err) => {
    redisAvailable = false;
    logger.warn(`Redis warn: ${err.message}`);
  });

  redisClient.on("ready", () => {
    redisAvailable = true;
    if (activeOps === 0) {
      const stream = (redisClient as any)?.stream;
      if (stream && typeof stream.unref === "function") {
        stream.unref();
      }
    }
    logger.info("Redis client ready");
  });
}

export const getDashboardSummaryCacheKey = (userId: number): string =>
  `dashboard:summary:${userId}`;

export const getDashboardCashflowCacheKey = (userId: number): string =>
  `dashboard:cashflow:${userId}`;

const getFromMemory = <T>(key: string): T | null => {
  const entry = memoryStore.get(key);
  if (!entry) {
    return null;
  }
  if (Date.now() > entry.expiresAt) {
    memoryStore.delete(key);
    return null;
  }
  return JSON.parse(entry.value) as T;
};

const setInMemory = (key: string, serialized: string, ttlSeconds: number): void => {
  memoryStore.set(key, {
    value: serialized,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });
};

export const getCache = async <T>(key: string): Promise<T | null> => {
  if (redisClient && redisAvailable) {
    refStream();
    try {
      const cached = await redisClient.get(key);
      if (cached) {
        return JSON.parse(cached) as T;
      }
      return null;
    } catch (err: any) {
      redisAvailable = false;
      logger.warn(`Redis GET fallback: ${err.message}`);
    } finally {
      unrefStream();
    }
  }
  return getFromMemory<T>(key);
};

export const setCache = async (
  key: string,
  value: unknown,
  ttlSeconds = 300
): Promise<void> => {
  const serialized = JSON.stringify(value);
  setInMemory(key, serialized, ttlSeconds);

  if (redisClient && redisAvailable) {
    refStream();
    try {
      await redisClient.set(key, serialized, "EX", ttlSeconds);
    } catch (err: any) {
      redisAvailable = false;
      logger.warn(`Redis SET fallback: ${err.message}`);
    } finally {
      unrefStream();
    }
  }
};

export const deleteCache = async (...keys: string[]): Promise<void> => {
  for (const key of keys) {
    memoryStore.delete(key);
  }

  if (redisClient && redisAvailable && keys.length > 0) {
    refStream();
    try {
      await redisClient.del(...keys);
    } catch (err: any) {
      redisAvailable = false;
      logger.warn(`Redis DEL fallback: ${err.message}`);
    } finally {
      unrefStream();
    }
  }
};

export const invalidateDashboardCache = async (userId: number): Promise<void> => {
  const summaryKey = getDashboardSummaryCacheKey(userId);
  const cashflowKey = getDashboardCashflowCacheKey(userId);
  await deleteCache(summaryKey, cashflowKey);
};
