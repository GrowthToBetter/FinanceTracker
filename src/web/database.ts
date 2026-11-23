import { PrismaClient } from "@prisma/client";
import { logger } from "./logging.js";

declare global {
  interface BigInt {
    toJSON(): number | string;
  }
}

BigInt.prototype.toJSON = function (): number | string {
  const num = Number(this);
  return Number.isSafeInteger(num) ? num : this.toString();
};

export const prismaClient = new PrismaClient({
  log: [
    {
      emit: "event",
      level: "query",
    },
    {
      emit: "event",
      level: "error",
    },
    {
      emit: "event",
      level: "info",
    },
    {
      emit: "event",
      level: "warn",
    },
  ],
});

prismaClient.$on("error" as never, (e: { message: string }) => {
  logger.error(`Error: ${e.message}`);
});

prismaClient.$on("info" as never, (e: { message: string }) => {
  logger.info(`Info: ${e.message}`);
});

prismaClient.$on("warn" as never, (e: { message: string }) => {
  logger.warn(`Warn: ${e.message}`);
});

prismaClient.$on("query" as never, (e: { query: string; params: string; duration: number }) => {
  logger.info(`Query: ${e.query} | Params: ${e.params} | Duration: ${e.duration}ms`);
});
