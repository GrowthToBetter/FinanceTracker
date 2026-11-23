import { Request, Response, NextFunction } from "express";
import { ResponseError } from "../error/response.error.js";
import { logger } from "../web/logging.js";

const errorMiddleware = async (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof ResponseError) {
    res.status(err.status).json({
      status: err.status,
      data: null,
      message: err.message,
    }).end();
  } else {
    logger.error(err);
    res.status(500).json({
      status: 500,
      data: null,
      message: "Internal Server Error",
    }).end();
  }
};

export { errorMiddleware };
