import { prismaClient } from "../web/database.js";
import { Wallet, WalletType } from "@prisma/client";

const create = async (data: {
  userId: number;
  name: string;
  type: WalletType;
  balance: bigint;
}): Promise<Wallet> => {
  return prismaClient.wallet.create({
    data,
  });
};

const findAllByUserId = async (userId: number): Promise<Wallet[]> => {
  return prismaClient.wallet.findMany({
    where: { userId },
    orderBy: { id: "asc" },
  });
};

const findByIdAndUserId = async (
  id: number,
  userId: number
): Promise<Wallet | null> => {
  return prismaClient.wallet.findFirst({
    where: { id, userId },
  });
};

const update = async (
  id: number,
  userId: number,
  data: { name?: string; type?: WalletType }
): Promise<Wallet> => {
  return prismaClient.wallet.update({
    where: { id, userId },
    data,
  });
};

const deleteById = async (id: number): Promise<Wallet> => {
  return prismaClient.wallet.delete({
    where: { id },
  });
};

export default {
  create,
  findAllByUserId,
  findByIdAndUserId,
  update,
  deleteById,
};
