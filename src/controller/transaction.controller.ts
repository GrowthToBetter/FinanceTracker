import { Request, Response, NextFunction } from "express";
import transactionService from "../service/transaction.service.js";
import { ResponseError } from "../error/response.error.js";

const parseTransactionId = (idParam: string | string[] | undefined): number => {
  const rawId = Array.isArray(idParam) ? idParam[0] : idParam;
  const id = Number(rawId);
  if (!rawId || isNaN(id) || id <= 0) {
    throw new ResponseError(400, "Invalid transaction id");
  }
  return id;
};

const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const idempotencyKey = req.idempotencyKey || req.header("Idempotency-Key")!;
    const result = await transactionService.create(
      req.user!.id,
      idempotencyKey,
      req.body
    );
    res.status(201).json({
      status: 201,
      data: result,
      message: "Create transaction success",
    });
  } catch (error) {
    next(error);
  }
};

const transfer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const idempotencyKey = req.idempotencyKey || req.header("Idempotency-Key")!;
    const result = await transactionService.transfer(
      req.user!.id,
      idempotencyKey,
      req.body
    );
    res.status(201).json({
      status: 201,
      data: result,
      message: "Transfer transaction success",
    });
  } catch (error) {
    next(error);
  }
};

const list = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await transactionService.list(
      req.user!.id,
      req.query as any
    );
    res.status(200).json({
      status: 200,
      data: result.data,
      paging: result.paging,
      message: "Get transactions success",
    });
  } catch (error) {
    next(error);
  }
};

const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const transactionId = parseTransactionId(req.params.id);
    const result = await transactionService.get(req.user!.id, transactionId);
    res.status(200).json({
      status: 200,
      data: result,
      message: "Get transaction detail success",
    });
  } catch (error) {
    next(error);
  }
};

const voidTransaction = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const transactionId = parseTransactionId(req.params.id);
    const result = await transactionService.voidTransaction(
      req.user!.id,
      transactionId
    );
    res.status(200).json({
      status: 200,
      data: result,
      message: "Transaction voided successfully",
    });
  } catch (error) {
    next(error);
  }
};

export default {
  create,
  transfer,
  list,
  get,
  voidTransaction,
};
