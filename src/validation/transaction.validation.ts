import { z } from "zod";

const createTransactionValidation = z.object({
  fromWalletId: z.number().int("Wallet ID must be an integer").positive("Invalid wallet id"),
  categoryId: z.number().int("Category ID must be an integer").positive("Invalid category id").optional(),
  type: z.enum(["INCOME", "EXPENSE"]),
  amount: z.number().int("Amount must be an integer").positive("Amount must be greater than zero"),
  note: z.string().max(255).optional(),
  date: z.string().datetime().optional(),
});

const createTransferValidation = z.object({
  fromWalletId: z.number().int("Source wallet ID must be an integer").positive("Invalid source wallet id"),
  toWalletId: z.number().int("Destination wallet ID must be an integer").positive("Invalid destination wallet id"),
  amount: z.number().int("Amount must be an integer").positive("Amount must be greater than zero"),
  note: z.string().max(255).optional(),
  date: z.string().datetime().optional(),
});

const isValidDateString = (val: string) => !isNaN(Date.parse(val));

const listTransactionsValidation = z.object({
  page: z.coerce.number().int().min(1).default(1),
  size: z.coerce.number().int().min(1).max(100).default(10),
  type: z.enum(["INCOME", "EXPENSE", "TRANSFER"]).optional(),
  status: z.enum(["POSTED", "VOIDED"]).optional(),
  walletId: z.coerce.number().int().positive().optional(),
  categoryId: z.coerce.number().int().positive().optional(),
  startDate: z.string().refine(isValidDateString, { message: "Invalid startDate format" }).optional(),
  endDate: z.string().refine(isValidDateString, { message: "Invalid endDate format" }).optional(),
});

export type CreateTransactionRequest = z.infer<typeof createTransactionValidation>;
export type CreateTransferRequest = z.infer<typeof createTransferValidation>;
export type ListTransactionsRequest = z.infer<typeof listTransactionsValidation>;

export {
  createTransactionValidation,
  createTransferValidation,
  listTransactionsValidation,
};
