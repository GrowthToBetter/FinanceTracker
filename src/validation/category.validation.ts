import { z } from "zod";

const createCategoryValidation = z.object({
  name: z.string().trim().min(1, "Category name cannot be empty").max(100),
});

const updateCategoryValidation = z.object({
  name: z.string().trim().min(1, "Category name cannot be empty").max(100),
});

export type CreateCategoryRequest = z.infer<typeof createCategoryValidation>;
export type UpdateCategoryRequest = z.infer<typeof updateCategoryValidation>;

export { createCategoryValidation, updateCategoryValidation };
