import { prismaClient } from "../web/database.js";
import { Budget } from "@prisma/client";

const create = async (data: {
  userId: number;
  categoryId: number;
  amount: bigint;
  month: number;
  year: number;
}): Promise<Budget> => {
  return prismaClient.budget.create({
    data,
  });
};

const findByUserCategoryMonthYear = async (
  userId: number,
  categoryId: number,
  month: number,
  year: number,
): Promise<Budget | null> => {
  return prismaClient.budget.findUnique({
    where: {
      userId_categoryId_month_year: {
        userId,
        categoryId,
        month,
        year,
      },
    },
  });
};

const findManyByUserId = async (userId: number) => {
  return prismaClient.budget.findMany({
    where: { userId },
    include: {
      category: true,
    },
    orderBy: { createdAt: "desc" },
  });
};

const findByIdAndUserId = async (id: number, userId: number) => {
  return prismaClient.budget.findFirst({
    where: { id, userId },
    include: {
      category: true,
    },
  });
};

const update = async (id: number, amount: bigint): Promise<Budget> => {
  return prismaClient.budget.update({
    where: { id },
    data: { amount },
  });
};

const deleteById = async (id: number): Promise<Budget> => {
  return prismaClient.budget.delete({
    where: { id },
  });
};

const getUsedAmount = async (
  userId: number,
  categoryId: number,
  month: number,
  year: number,
): Promise<bigint> => {
  const startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
  const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

  const result = await prismaClient.transaction.aggregate({
    _sum: { amount: true },
    where: {
      userId,
      categoryId,
      type: "EXPENSE",
      status: "POSTED",
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
  });

  return result._sum.amount ?? 0n;
};

export default {
  create,
  findByUserCategoryMonthYear,
  findManyByUserId,
  findByIdAndUserId,
  update,
  deleteById,
  getUsedAmount,
};
