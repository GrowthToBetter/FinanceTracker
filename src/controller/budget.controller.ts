import { Request, Response, NextFunction } from "express";
import budgetService from "../service/budget.service.js";
import { ResponseError } from "../error/response.error.js";

const parseBudgetId = (idParam: string | string[] | undefined): number => {
  const rawId = Array.isArray(idParam) ? idParam[0] : idParam;
  const id = Number(rawId);
  if (!rawId || isNaN(id) || id <= 0) {
    throw new ResponseError(400, "Invalid budget id");
  }
  return id;
};

const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await budgetService.create(req.user!.id, req.body);
    res.status(201).json({
      status: 201,
      data: result,
      message: "Create budget success",
    });
  } catch (error) {
    next(error);
  }
};

const list = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await budgetService.list(req.user!.id);
    res.status(200).json({
      status: 200,
      data: result,
      message: "Get budgets success",
    });
  } catch (error) {
    next(error);
  }
};

const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const budgetId = parseBudgetId(req.params.id);
    const result = await budgetService.get(req.user!.id, budgetId);
    res.status(200).json({
      status: 200,
      data: result,
      message: "Get budget detail success",
    });
  } catch (error) {
    next(error);
  }
};

const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const budgetId = parseBudgetId(req.params.id);
    const result = await budgetService.update(req.user!.id, budgetId, req.body);
    res.status(200).json({
      status: 200,
      data: result,
      message: "Update budget success",
    });
  } catch (error) {
    next(error);
  }
};

const deleteBudget = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const budgetId = parseBudgetId(req.params.id);
    const result = await budgetService.deleteBudget(req.user!.id, budgetId);
    res.status(200).json({
      status: 200,
      data: result,
      message: "Delete budget success",
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
  deleteBudget,
};
