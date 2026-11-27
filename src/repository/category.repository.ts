import { prismaClient } from "../web/database.js";
import { Category } from "@prisma/client";

const create = async (name: string): Promise<Category> => {
  return prismaClient.category.create({
    data: { name },
  });
};

const findAll = async (): Promise<Category[]> => {
  return prismaClient.category.findMany({
    orderBy: { id: "asc" },
  });
};

const findById = async (id: number): Promise<Category | null> => {
  return prismaClient.category.findUnique({
    where: { id },
  });
};

const update = async (id: number, name: string): Promise<Category> => {
  return prismaClient.category.update({
    where: { id },
    data: { name },
  });
};

const deleteById = async (id: number): Promise<Category> => {
  return prismaClient.category.delete({
    where: { id },
  });
};

const countReferences = async (id: number): Promise<{ transactions: number; budgets: number }> => {
  const [transactions, budgets] = await Promise.all([
    prismaClient.transaction.count({ where: { categoryId: id } }),
    prismaClient.budget.count({ where: { categoryId: id } }),
  ]);

  return { transactions, budgets };
};

export default {
  create,
  findAll,
  findById,
  update,
  deleteById,
  countReferences,
};
