import { prismaClient } from "../web/database.js";
import { SavingsGoal } from "@prisma/client";

const create = async (data: {
  userId: number;
  walletId?: number;
  name: string;
  targetAmount: bigint;
  currentAmount: bigint;
  deadline?: Date;
}): Promise<SavingsGoal> => {
  return prismaClient.savingsGoal.create({
    data,
  });
};

const findManyByUserId = async (userId: number): Promise<SavingsGoal[]> => {
  return prismaClient.savingsGoal.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
};

const findByIdAndUserId = async (
  id: number,
  userId: number
): Promise<SavingsGoal | null> => {
  return prismaClient.savingsGoal.findFirst({
    where: { id, userId },
  });
};

const update = async (
  id: number,
  data: {
    name?: string;
    targetAmount?: bigint;
    currentAmount?: bigint;
    walletId?: number | null;
    deadline?: Date | null;
  }
): Promise<SavingsGoal> => {
  return prismaClient.savingsGoal.update({
    where: { id },
    data,
  });
};

const deleteById = async (id: number): Promise<SavingsGoal> => {
  return prismaClient.savingsGoal.delete({
    where: { id },
  });
};

export default {
  create,
  findManyByUserId,
  findByIdAndUserId,
  update,
  deleteById,
};
