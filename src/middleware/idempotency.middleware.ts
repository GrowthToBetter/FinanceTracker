import { Request, Response, NextFunction } from "express";
import { ResponseError } from "../error/response.error.js";
import transactionRepository from "../repository/transaction.repository.js";

export const idempotencyMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const rawKey = req.header("Idempotency-Key");
    if (!rawKey || rawKey.trim().length === 0) {
      throw new ResponseError(400, "Idempotency-Key header is required");
      return;
    }

    const idempotencyKey = rawKey.trim();
    if (idempotencyKey.length > 255) {
      throw new ResponseError(400, "Idempotency-Key must not exceed 255 characters");
    }

    const existingTransaction = await transactionRepository.findByIdempotencyKey(idempotencyKey);
    if (existingTransaction) {
      if (req.user && existingTransaction.userId !== req.user.id) {
        throw new ResponseError(409, "Idempotency key collision");
      }

      res.status(200).json({
        status: 200,
        data: existingTransaction,
        message:
          existingTransaction.type === "TRANSFER"
            ? "Transfer transaction success"
            : "Create transaction success",
      });
      return;
    }

    req.idempotencyKey = idempotencyKey;
    next();
  } catch (error) {
    next(error);
  }
};
