import { z } from "zod";

const walletTypeEnum = z.enum(["CASH", "BANK", "EWALLET", "SAVINGS"]);

const createWalletValidation = z.object({
  name: z.string().min(1, "Name is required").max(255),
  type: walletTypeEnum,
  balance: z.number().int("Balance must be an integer").min(0, "Balance cannot be negative").optional(),
});

const updateWalletValidation = z.object({
  name: z.string().min(1, "Name cannot be empty").max(255).optional(),
  type: walletTypeEnum.optional(),
});

export type CreateWalletRequest = z.infer<typeof createWalletValidation>;
export type UpdateWalletRequest = z.infer<typeof updateWalletValidation>;

export { createWalletValidation, updateWalletValidation };
