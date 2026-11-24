import express from "express";
import transactionController from "../controller/transaction.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { idempotencyMiddleware } from "../middleware/idempotency.middleware.js";

const transactionRouter = express.Router();
transactionRouter.use(authMiddleware);

transactionRouter.post(
  "/api/transactions",
  idempotencyMiddleware,
  transactionController.create
);

transactionRouter.post(
  "/api/transactions/transfer",
  idempotencyMiddleware,
  transactionController.transfer
);

transactionRouter.get("/api/transactions", transactionController.list);

transactionRouter.get("/api/transactions/:id", transactionController.get);

transactionRouter.post(
  "/api/transactions/:id/void",
  transactionController.voidTransaction
);

export { transactionRouter };
