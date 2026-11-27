import { Request, Response, NextFunction } from "express";
import savingsGoalService from "../service/savings-goal.service.js";
import { ResponseError } from "../error/response.error.js";

const parseSavingsGoalId = (idParam: string | string[] | undefined): number => {
  const rawId = Array.isArray(idParam) ? idParam[0] : idParam;
  const id = Number(rawId);
  if (!rawId || isNaN(id) || id <= 0) {
    throw new ResponseError(400, "Invalid savings goal id");
  }
  return id;
};

const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await savingsGoalService.create(req.user!.id, req.body);
    res.status(201).json({
      status: 201,
      data: result,
      message: "Create savings goal success",
    });
  } catch (error) {
    next(error);
  }
};

const list = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await savingsGoalService.list(req.user!.id);
    res.status(200).json({
      status: 200,
      data: result,
      message: "Get savings goals success",
    });
  } catch (error) {
    next(error);
  }
};

const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const goalId = parseSavingsGoalId(req.params.id);
    const result = await savingsGoalService.get(req.user!.id, goalId);
    res.status(200).json({
      status: 200,
      data: result,
      message: "Get savings goal detail success",
    });
  } catch (error) {
    next(error);
  }
};

const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const goalId = parseSavingsGoalId(req.params.id);
    const result = await savingsGoalService.update(
      req.user!.id,
      goalId,
      req.body
    );
    res.status(200).json({
      status: 200,
      data: result,
      message: "Update savings goal success",
    });
  } catch (error) {
    next(error);
  }
};

const deleteSavingsGoal = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const goalId = parseSavingsGoalId(req.params.id);
    const result = await savingsGoalService.deleteSavingsGoal(
      req.user!.id,
      goalId
    );
    res.status(200).json({
      status: 200,
      data: result,
      message: "Delete savings goal success",
    });
  } catch (error) {
    next(error);
  }
};

export default {
  create,
  list,
  get,
  update,
  deleteSavingsGoal,
};
