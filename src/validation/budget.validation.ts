import { z } from "zod";

const createBudgetValidation = z.object({
  categoryId: z.number().int("Category ID must be an integer").positive("Invalid category id"),
  amount: z.number().int("Amount must be an integer").positive("Amount must be greater than zero"),
  month: z.number().int("Month must be an integer").min(1).max(12, "Month must be between 1 and 12"),
  year: z.number().int("Year must be an integer").min(2000).max(2100, "Year must be valid"),
});

const updateBudgetValidation = z.object({
  amount: z.number().int("Amount must be an integer").positive("Amount must be greater than zero"),
});

export type CreateBudgetRequest = z.infer<typeof createBudgetValidation>;
export type UpdateBudgetRequest = z.infer<typeof updateBudgetValidation>;

export { createBudgetValidation, updateBudgetValidation };
