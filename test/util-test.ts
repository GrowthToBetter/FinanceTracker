import bcrypt from "bcrypt";
import { prismaClient } from "../src/web/database.js";
import { WalletType } from "@prisma/client";

const removeTestUser = async (email = "testuser@example.com") => {
  const user = await prismaClient.user.findUnique({
    where: { email },
  });

  if (user) {
    await prismaClient.wallet.deleteMany({
      where: { userId: user.id },
    });
    await prismaClient.user.delete({
      where: { id: user.id },
    });
  }
};

const createTestUser = async (email = "testuser@example.com") => {
  await removeTestUser(email);
  const hashedPassword = await bcrypt.hash("password123", 10);
  return prismaClient.user.create({
    data: {
      name: "Test User",
      email,
      password: hashedPassword,
      token: "test-token",
    },
  });
};

const createTestWallet = async (
  userId: number,
  name = "Test Wallet",
  type: WalletType = "BANK",
  balance = 0n
) => {
  return prismaClient.wallet.create({
    data: {
      userId,
      name,
      type,
      balance,
    },
  });
};

const removeTestCategory = async (name = "Test Category") => {
  await prismaClient.category.deleteMany({
    where: { name },
  });
};

const createTestCategory = async (name = "Test Category") => {
  return prismaClient.category.create({
    data: { name },
  });
};

export {
  removeTestUser,
  createTestUser,
  createTestWallet,
  removeTestCategory,
  createTestCategory,
};
