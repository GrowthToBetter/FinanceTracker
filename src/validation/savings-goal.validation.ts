import { z } from "zod";

const isValidDate = (val: string) => !isNaN(Date.parse(val));

const createSavingsGoalValidation = z.object({
  name: z
    .string()
    .min(1, "Savings goal name is required")
    .max(255, "Savings goal name must not exceed 255 characters"),
  targetAmount: z
    .number()
    .int("Target amount must be an integer")
    .positive("Target amount must be greater than zero"),
  currentAmount: z
    .number()
    .int("Current amount must be an integer")
    .min(0, "Current amount cannot be negative")
    .optional(),
  walletId: z
    .number()
    .int("Wallet ID must be an integer")
    .positive("Invalid wallet id")
    .optional(),
  deadline: z
    .string()
    .refine(isValidDate, { message: "Invalid deadline date format" })
    .optional(),
});

const updateSavingsGoalValidation = z.object({
  name: z
    .string()
    .min(1, "Savings goal name must not be empty")
    .max(255, "Savings goal name must not exceed 255 characters")
    .optional(),
  targetAmount: z
    .number()
    .int("Target amount must be an integer")
    .positive("Target amount must be greater than zero")
    .optional(),
  currentAmount: z
    .number()
    .int("Current amount must be an integer")
    .min(0, "Current amount cannot be negative")
    .optional(),
  walletId: z
    .number()
    .int("Wallet ID must be an integer")
    .positive("Invalid wallet id")
    .nullable()
    .optional(),
  deadline: z
    .string()
    .refine(isValidDate, { message: "Invalid deadline date format" })
    .nullable()
    .optional(),
});

export type CreateSavingsGoalRequest = z.infer<typeof createSavingsGoalValidation>;
export type UpdateSavingsGoalRequest = z.infer<typeof updateSavingsGoalValidation>;

export { createSavingsGoalValidation, updateSavingsGoalValidation };
