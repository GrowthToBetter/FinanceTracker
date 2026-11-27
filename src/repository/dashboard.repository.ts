import { prismaClient } from "../web/database.js";
import { TransactionType } from "@prisma/client";

const findWalletsByUserId = async (userId: number) => {
  return prismaClient.wallet.findMany({
    where: { userId },
    select: {
      id: true,
      name: true,
      type: true,
      balance: true,
    },
    orderBy: { id: "asc" },
  });
};

const getMonthlyAmountByType = async (
  userId: number,
  type: TransactionType,
  month: number,
  year: number
): Promise<bigint> => {
  const startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
  const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

  const result = await prismaClient.transaction.aggregate({
    _sum: { amount: true },
    where: {
      userId,
      type,
      status: "POSTED",
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
  });

  return result._sum.amount ?? 0n;
};

const countActiveBudgets = async (
  userId: number,
  month: number,
  year: number
): Promise<number> => {
  return prismaClient.budget.count({
    where: {
      userId,
      month,
      year,
    },
  });
};

const findPostedIncomeAndExpenseTransactions = async (userId: number) => {
  return prismaClient.transaction.findMany({
    where: {
      userId,
      status: "POSTED",
      type: {
        in: ["INCOME", "EXPENSE"],
      },
    },
    select: {
      type: true,
      amount: true,
      date: true,
    },
    orderBy: { date: "asc" },
  });
};

export default {
  findWalletsByUserId,
  getMonthlyAmountByType,
  countActiveBudgets,
  findPostedIncomeAndExpenseTransactions,
};
