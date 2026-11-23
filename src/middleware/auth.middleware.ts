import { Request, Response, NextFunction } from "express";
import { ResponseError } from "../error/response.error.js";
import userRepository from "../repository/user.repository.js";
import "../type/user.type.js";

const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let token = req.get("Authorization");

  if (!token) {
    return next(new ResponseError(401, "Unauthorized"));
  }

  if (token.startsWith("Bearer ")) {
    token = token.substring(7);
  }

  const user = await userRepository.findByToken(token);
  if (!user) {
    return next(new ResponseError(401, "Unauthorized"));
  }

  const { password, ...userWithoutPassword } = user;
  req.user = userWithoutPassword;

  next();
};

export { authMiddleware };
