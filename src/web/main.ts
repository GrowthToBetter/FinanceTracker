import express from "express";
import { errorMiddleware } from "../middleware/error.middleware.js";

export const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

app.use(errorMiddleware);
