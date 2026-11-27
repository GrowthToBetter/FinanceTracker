import { prismaClient } from "../web/database.js";
import { Transaction, TransactionType } from "@prisma/client";
import { ListTransactionsRequest } from "../validation/transaction.validation.js";

interface LockedWallet {
  id: number;
  userId: number;
  balance: bigint;
}

const findById = async (id: number): Promise<Transaction | null> => {
  return prismaClient.transaction.findUnique({
    where: { id },
  });
};

const findByIdAndUserId = async (
  id: number,
  userId: number
): Promise<Transaction | null> => {
  return prismaClient.transaction.findFirst({
    where: { id, userId },
  });
};

const findByIdempotencyKey = async (
  key: string
): Promise<Transaction | null> => {
  return prismaClient.transaction.findUnique({
    where: { idempotencyKey: key },
  });
};

const findMany = async (
  userId: number,
  filters: ListTransactionsRequest
): Promise<{ transactions: Transaction[]; total: number }> => {
  const where: any = { userId };

  if (filters.type) {
    where.type = filters.type as TransactionType;
  }

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.walletId) {
    where.OR = [
      { fromWalletId: filters.walletId },
      { toWalletId: filters.walletId },
    ];
  }

  if (filters.categoryId) {
    where.categoryId = filters.categoryId;
  }

  if (filters.startDate || filters.endDate) {
    where.date = {};
    if (filters.startDate) {
      where.date.gte = new Date(filters.startDate);
    }
    if (filters.endDate) {
      const endStr =
        filters.endDate.length === 10
          ? `${filters.endDate}T23:59:59.999Z`
          : filters.endDate;
      where.date.lte = new Date(endStr);
    }
  }

  const skip = (filters.page - 1) * filters.size;

  const [transactions, total] = await Promise.all([
    prismaClient.transaction.findMany({
      where,
      orderBy: { date: "desc" },
      skip,
      take: filters.size,
    }),
    prismaClient.transaction.count({ where }),
  ]);

  return { transactions, total };
};

const lockWallet = async (
  tx: any,
  walletId: number
): Promise<LockedWallet | null> => {
  const rows: LockedWallet[] = await tx.$queryRaw`
    SELECT id, "userId", balance
    FROM "finance_tracker"."Wallet"
    WHERE id = ${walletId}
    FOR UPDATE
  `;
  return rows[0] ?? null;
};

const lockWalletsOrdered = async (
  tx: any,
  walletId1: number,
  walletId2: number
): Promise<LockedWallet[]> => {
  const [firstId, secondId] =
    walletId1 < walletId2 ? [walletId1, walletId2] : [walletId2, walletId1];

  const rows: LockedWallet[] = await tx.$queryRaw`
    SELECT id, "userId", balance
    FROM "finance_tracker"."Wallet"
    WHERE id IN (${firstId}, ${secondId})
    ORDER BY id ASC
    FOR UPDATE
  `;
  return rows;
};

export default {
  findById,
  findByIdAndUserId,
  findByIdempotencyKey,
  findMany,
  lockWallet,
  lockWalletsOrdered,
};
