import budgetRepository from "../repository/budget.repository.js";
import categoryRepository from "../repository/category.repository.js";
import notificationRepository from "../repository/notification.repository.js";
import { logger } from "../web/logging.js";

export const checkBudgetThreshold = async (
  userId: number,
  categoryId: number,
  date: Date = new Date()
): Promise<void> => {
  try {
    const month = date.getUTCMonth() + 1;
    const year = date.getUTCFullYear();

    const budget = await budgetRepository.findByUserCategoryMonthYear(
      userId,
      categoryId,
      month,
      year
    );

    if (!budget) {
      return;
    }

    const category = await categoryRepository.findById(categoryId);
    const categoryName = category?.name ?? "Category";

    const usedAmount = await budgetRepository.getUsedAmount(
      userId,
      categoryId,
      month,
      year
    );

    const percentage = (Number(usedAmount) / Number(budget.amount)) * 100;
    const percentageFixed = percentage.toFixed(2);

    let message: string | null = null;

    if (percentage >= 100) {
      message = `Warning: ${categoryName} budget reached ${percentageFixed}% of monthly limit`;
    } else if (percentage >= 80) {
      message = `Warning: ${categoryName} budget reached ${percentageFixed}% of monthly limit`;
    }

    if (message) {
      await notificationRepository.create(userId, message);
    }
  } catch (err: any) {
    logger.error(`Failed to process budget alert: ${err.message}`);
  }
};
