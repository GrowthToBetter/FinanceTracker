import bcrypt from "bcrypt";
import { prismaClient } from "../src/web/database.js";
import { WalletType } from "@prisma/client";

const removeTestUser = async (email = "testuser@example.com") => {
  const user = await prismaClient.user.findUnique({
    where: { email },
  });

  if (user) {
    await prismaClient.notification.deleteMany({
      where: { userId: user.id },
    });
    await prismaClient.transaction.deleteMany({
      where: { userId: user.id },
    });
    await prismaClient.budget.deleteMany({
      where: { userId: user.id },
    });
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
  const categories = await prismaClient.category.findMany({
    where: { name },
  });

  for (const cat of categories) {
    await prismaClient.budget.deleteMany({
      where: { categoryId: cat.id },
    });
    await prismaClient.transaction.deleteMany({
      where: { categoryId: cat.id },
    });
    await prismaClient.category.delete({
      where: { id: cat.id },
    });
  }
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
