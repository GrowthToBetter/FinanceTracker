import savingsGoalRepository from "../repository/savings-goal.repository.js";
import walletRepository from "../repository/wallet.repository.js";
import { ResponseError } from "../error/response.error.js";
import { validate } from "../validation/validation.js";
import {
  createSavingsGoalValidation,
  updateSavingsGoalValidation,
  CreateSavingsGoalRequest,
  UpdateSavingsGoalRequest,
} from "../validation/savings-goal.validation.js";
import { SavingsGoal } from "@prisma/client";

const formatGoalWithProgress = (goal: SavingsGoal) => {
  const remainingAmount =
    goal.targetAmount > goal.currentAmount
      ? goal.targetAmount - goal.currentAmount
      : 0n;
  const percentage =
    goal.targetAmount > 0n
      ? Number(((Number(goal.currentAmount) / Number(goal.targetAmount)) * 100).toFixed(2))
      : 0;
  const isAchieved = goal.currentAmount >= goal.targetAmount;

  return {
    id: goal.id,
    userId: goal.userId,
    walletId: goal.walletId,
    name: goal.name,
    targetAmount: goal.targetAmount,
    currentAmount: goal.currentAmount,
    remainingAmount,
    percentageAchieved: percentage,
    isAchieved,
    deadline: goal.deadline,
    createdAt: goal.createdAt,
    updatedAt: goal.updatedAt,
  };
};

const create = async (userId: number, request: CreateSavingsGoalRequest) => {
  const data = validate(createSavingsGoalValidation, request);

  let initialCurrentAmount = BigInt(data.currentAmount ?? 0);

  if (data.walletId) {
    const wallet = await walletRepository.findByIdAndUserId(data.walletId, userId);
    if (!wallet) {
      throw new ResponseError(404, "Wallet not found");
    }
    if (data.currentAmount === undefined) {
      initialCurrentAmount = wallet.balance > 0n ? wallet.balance : 0n;
    }
  }

  const created = await savingsGoalRepository.create({
    userId,
    walletId: data.walletId,
    name: data.name,
    targetAmount: BigInt(data.targetAmount),
    currentAmount: initialCurrentAmount,
    deadline: data.deadline ? new Date(data.deadline) : undefined,
  });

  return formatGoalWithProgress(created);
};

const list = async (userId: number) => {
  const goals = await savingsGoalRepository.findManyByUserId(userId);
  return goals.map(formatGoalWithProgress);
};

const get = async (userId: number, goalId: number) => {
  const goal = await savingsGoalRepository.findByIdAndUserId(goalId, userId);
  if (!goal) {
    throw new ResponseError(404, "Savings goal not found");
  }
  return formatGoalWithProgress(goal);
};

const update = async (
  userId: number,
  goalId: number,
  request: UpdateSavingsGoalRequest
) => {
  const data = validate(updateSavingsGoalValidation, request);

  const existing = await savingsGoalRepository.findByIdAndUserId(goalId, userId);
  if (!existing) {
    throw new ResponseError(404, "Savings goal not found");
  }

  if (data.walletId) {
    const wallet = await walletRepository.findByIdAndUserId(data.walletId, userId);
    if (!wallet) {
      throw new ResponseError(404, "Wallet not found");
    }
  }

  const updated = await savingsGoalRepository.update(goalId, {
    name: data.name,
    targetAmount:
      data.targetAmount !== undefined ? BigInt(data.targetAmount) : undefined,
    currentAmount:
      data.currentAmount !== undefined ? BigInt(data.currentAmount) : undefined,
    walletId: data.walletId,
    deadline:
      data.deadline === null
        ? null
        : data.deadline !== undefined
          ? new Date(data.deadline)
          : undefined,
  });

  return formatGoalWithProgress(updated);
};

const deleteSavingsGoal = async (userId: number, goalId: number) => {
  const existing = await savingsGoalRepository.findByIdAndUserId(goalId, userId);
  if (!existing) {
    throw new ResponseError(404, "Savings goal not found");
  }

  await savingsGoalRepository.deleteById(goalId);
  return { id: goalId };
};

export default {
  create,
  list,
  get,
  update,
  deleteSavingsGoal,
};
