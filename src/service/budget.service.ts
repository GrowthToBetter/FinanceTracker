import budgetRepository from "../repository/budget.repository.js";
import categoryRepository from "../repository/category.repository.js";
import { ResponseError } from "../error/response.error.js";
import { validate } from "../validation/validation.js";
import {
  createBudgetValidation,
  updateBudgetValidation,
  CreateBudgetRequest,
  UpdateBudgetRequest,
} from "../validation/budget.validation.js";

const calculatePercentage = (used: bigint, total: bigint): number => {
  if (total === 0n) return 0;
  const percentage = (Number(used) / Number(total)) * 100;
  return Number(percentage.toFixed(2));
};

const create = async (userId: number, request: CreateBudgetRequest) => {
  const data = validate(createBudgetValidation, request);

  const category = await categoryRepository.findById(data.categoryId);
  if (!category) {
    throw new ResponseError(404, "Category not found");
  }

  const existingBudget = await budgetRepository.findByUserCategoryMonthYear(
    userId,
    data.categoryId,
    data.month,
    data.year
  );

  if (existingBudget) {
    throw new ResponseError(
      400,
      "Budget for this category in the specified month and year already exists"
    );
  }

  const budget = await budgetRepository.create({
    userId,
    categoryId: data.categoryId,
    amount: BigInt(data.amount),
    month: data.month,
    year: data.year,
  });

  return budget;
};

const list = async (userId: number) => {
  const budgets = await budgetRepository.findManyByUserId(userId);

  return Promise.all(
    budgets.map(async (b) => {
      const usedAmount = await budgetRepository.getUsedAmount(
        userId,
        b.categoryId,
        b.month,
        b.year
      );

      return {
        id: b.id,
        categoryId: b.categoryId,
        categoryName: b.category.name,
        amount: b.amount,
        usedAmount,
        percentageUsed: calculatePercentage(usedAmount, b.amount),
        month: b.month,
        year: b.year,
      };
    })
  );
};

const get = async (userId: number, budgetId: number) => {
  const budget = await budgetRepository.findByIdAndUserId(budgetId, userId);
  if (!budget) {
    throw new ResponseError(404, "Budget not found");
  }

  const usedAmount = await budgetRepository.getUsedAmount(
    userId,
    budget.categoryId,
    budget.month,
    budget.year
  );

  const remainingAmount =
    budget.amount > usedAmount ? budget.amount - usedAmount : 0n;

  return {
    id: budget.id,
    userId: budget.userId,
    categoryId: budget.categoryId,
    amount: budget.amount,
    usedAmount,
    remainingAmount,
    percentageUsed: calculatePercentage(usedAmount, budget.amount),
    month: budget.month,
    year: budget.year,
    createdAt: budget.createdAt,
    updatedAt: budget.updatedAt,
  };
};

const update = async (
  userId: number,
  budgetId: number,
  request: UpdateBudgetRequest
) => {
  const data = validate(updateBudgetValidation, request);

  const existing = await budgetRepository.findByIdAndUserId(budgetId, userId);
  if (!existing) {
    throw new ResponseError(404, "Budget not found");
  }

  const updated = await budgetRepository.update(budgetId, BigInt(data.amount));
  return updated;
};

const deleteBudget = async (userId: number, budgetId: number) => {
  const existing = await budgetRepository.findByIdAndUserId(budgetId, userId);
  if (!existing) {
    throw new ResponseError(404, "Budget not found");
  }

  await budgetRepository.deleteById(budgetId);
  return { id: budgetId };
};

export default {
  create,
  list,
  get,
  update,
  deleteBudget,
};
