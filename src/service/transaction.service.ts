import { prismaClient } from "../web/database.js";
import { invalidateDashboardCache } from "../web/redis.js";
import transactionRepository from "../repository/transaction.repository.js";
import { checkBudgetThreshold } from "./alert.service.js";
import { ResponseError } from "../error/response.error.js";
import { validate } from "../validation/validation.js";
import {
  createTransactionValidation,
  createTransferValidation,
  listTransactionsValidation,
  CreateTransactionRequest,
  CreateTransferRequest,
  ListTransactionsRequest,
} from "../validation/transaction.validation.js";

const create = async (
  userId: number,
  idempotencyKey: string,
  request: CreateTransactionRequest
) => {
  const data = validate(createTransactionValidation, request);
  const amountBigInt = BigInt(data.amount);

  const result = await prismaClient.$transaction(async (tx) => {
    const wallet = await transactionRepository.lockWallet(tx, data.fromWalletId);
    if (!wallet || wallet.userId !== userId) {
      throw new ResponseError(404, "Wallet not found");
    }

    if (data.categoryId) {
      const category = await tx.category.findUnique({
        where: { id: data.categoryId },
      });
      if (!category) {
        throw new ResponseError(404, "Category not found");
      }
    }

    if (data.type === "EXPENSE") {
      if (wallet.balance < amountBigInt) {
        throw new ResponseError(400, "Insufficient wallet balance");
      }
      await tx.wallet.update({
        where: { id: data.fromWalletId },
        data: { balance: { decrement: amountBigInt } },
      });
    } else {
      await tx.wallet.update({
        where: { id: data.fromWalletId },
        data: { balance: { increment: amountBigInt } },
      });
    }

    const transaction = await tx.transaction.create({
      data: {
        userId,
        fromWalletId: data.fromWalletId,
        categoryId: data.categoryId,
        type: data.type,
        status: "POSTED",
        amount: amountBigInt,
        note: data.note,
        idempotencyKey,
        date: data.date ? new Date(data.date) : new Date(),
      },
    });

    return transaction;
  });

  await invalidateDashboardCache(userId);

  if (data.type === "EXPENSE" && data.categoryId) {
    checkBudgetThreshold(userId, data.categoryId, result.date);
  }

  return result;
};

const transfer = async (
  userId: number,
  idempotencyKey: string,
  request: CreateTransferRequest
) => {
  const data = validate(createTransferValidation, request);

  if (data.fromWalletId === data.toWalletId) {
    throw new ResponseError(400, "Source and destination wallet cannot be the same");
  }

  const amountBigInt = BigInt(data.amount);

  const result = await prismaClient.$transaction(async (tx) => {
    const wallets = await transactionRepository.lockWalletsOrdered(
      tx,
      data.fromWalletId,
      data.toWalletId
    );

    const fromWallet = wallets.find(
      (w) => w.id === data.fromWalletId && w.userId === userId
    );
    const toWallet = wallets.find(
      (w) => w.id === data.toWalletId && w.userId === userId
    );

    if (!fromWallet || !toWallet) {
      throw new ResponseError(404, "Wallet not found");
    }

    if (fromWallet.balance < amountBigInt) {
      throw new ResponseError(400, "Insufficient wallet balance");
    }

    await tx.wallet.update({
      where: { id: data.fromWalletId },
      data: { balance: { decrement: amountBigInt } },
    });

    await tx.wallet.update({
      where: { id: data.toWalletId },
      data: { balance: { increment: amountBigInt } },
    });

    const transaction = await tx.transaction.create({
      data: {
        userId,
        fromWalletId: data.fromWalletId,
        toWalletId: data.toWalletId,
        type: "TRANSFER",
        status: "POSTED",
        amount: amountBigInt,
        note: data.note,
        idempotencyKey,
        date: data.date ? new Date(data.date) : new Date(),
      },
    });

    return transaction;
  });

  await invalidateDashboardCache(userId);

  return result;
};

const list = async (userId: number, request: ListTransactionsRequest) => {
  const data = validate(listTransactionsValidation, request);
  const { transactions, total } = await transactionRepository.findMany(userId, data);

  const totalPage = Math.ceil(total / data.size);

  return {
    data: transactions.map((t) => ({
      id: t.id,
      fromWalletId: t.fromWalletId,
      toWalletId: t.toWalletId,
      categoryId: t.categoryId,
      type: t.type,
      status: t.status,
      amount: t.amount,
      note: t.note,
      date: t.date,
    })),
    paging: {
      page: data.page,
      size: data.size,
      total_page: totalPage,
      total_items: total,
    },
  };
};

const get = async (userId: number, transactionId: number) => {
  const transaction = await transactionRepository.findByIdAndUserId(
    transactionId,
    userId
  );
  if (!transaction) {
    throw new ResponseError(404, "Transaction not found");
  }

  return transaction;
};

const voidTransaction = async (userId: number, transactionId: number) => {
  const result = await prismaClient.$transaction(async (tx) => {
    const transaction = await tx.transaction.findFirst({
      where: { id: transactionId, userId },
    });

    if (!transaction) {
      throw new ResponseError(404, "Transaction not found");
    }

    if (transaction.status === "VOIDED") {
      throw new ResponseError(400, "Transaction is already voided");
    }

    if (transaction.type === "EXPENSE") {
      const wallet = await transactionRepository.lockWallet(tx, transaction.fromWalletId);
      if (!wallet) {
        throw new ResponseError(404, "Wallet not found");
      }
      await tx.wallet.update({
        where: { id: transaction.fromWalletId },
        data: { balance: { increment: transaction.amount } },
      });
    } else if (transaction.type === "INCOME") {
      const wallet = await transactionRepository.lockWallet(tx, transaction.fromWalletId);
      if (!wallet) {
        throw new ResponseError(404, "Wallet not found");
      }
      if (wallet.balance < transaction.amount) {
        throw new ResponseError(400, "Insufficient wallet balance to void transaction");
      }
      await tx.wallet.update({
        where: { id: transaction.fromWalletId },
        data: { balance: { decrement: transaction.amount } },
      });
    } else if (transaction.type === "TRANSFER") {
      const wallets = await transactionRepository.lockWalletsOrdered(
        tx,
        transaction.fromWalletId,
        transaction.toWalletId!
      );
      const fromWallet = wallets.find((w) => w.id === transaction.fromWalletId);
      const toWallet = wallets.find((w) => w.id === transaction.toWalletId);

      if (!fromWallet || !toWallet) {
        throw new ResponseError(404, "Wallet not found");
      }

      if (toWallet.balance < transaction.amount) {
        throw new ResponseError(
          400,
          "Insufficient destination wallet balance to void transfer"
        );
      }

      await tx.wallet.update({
        where: { id: transaction.toWalletId! },
        data: { balance: { decrement: transaction.amount } },
      });
      await tx.wallet.update({
        where: { id: transaction.fromWalletId },
        data: { balance: { increment: transaction.amount } },
      });
    }

    const updated = await tx.transaction.update({
      where: { id: transactionId },
      data: { status: "VOIDED" },
    });

    return {
      id: updated.id,
      status: updated.status,
      updatedAt: updated.updatedAt,
    };
  });

  await invalidateDashboardCache(userId);

  return result;
};

export default {
  create,
  transfer,
  list,
  get,
  voidTransaction,
};
