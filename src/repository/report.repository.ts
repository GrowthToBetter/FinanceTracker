import { prismaClient } from "../web/database.js";
import { TransactionType } from "@prisma/client";
import { ExportReportRequest } from "../validation/report.validation.js";

const findTransactionsForExport = async (
  userId: number,
  filters: ExportReportRequest
) => {
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

  return prismaClient.transaction.findMany({
    where,
    include: {
      fromWallet: { select: { name: true } },
      toWallet: { select: { name: true } },
      category: { select: { name: true } },
    },
    orderBy: { date: "desc" },
  });
};

export default {
  findTransactionsForExport,
};
