import express from "express";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "../docs/swagger.js";
import { authRouter } from "../route/auth.api.js";
import { walletRouter } from "../route/wallet.api.js";
import { categoryRouter } from "../route/category.api.js";
import { transactionRouter } from "../route/transaction.api.js";
import { errorMiddleware } from "../middleware/error.middleware.js";

export const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/api-docs.json", (req, res) => {
  res.json(swaggerSpec);
});
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

app.use(authRouter);
app.use(walletRouter);
app.use(categoryRouter);
app.use(transactionRouter);
app.use(errorMiddleware);
