import { Request, Response, NextFunction } from "express";
import userService from "../service/user.service.js";

const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await userService.register(req.body);
    res.status(201).json({
      status: 201,
      data: result,
      message: "User registered successfully",
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await userService.login(req.body);
    res.status(200).json({
      status: 200,
      data: result,
      message: "Login successful",
    });
  } catch (error) {
    next(error);
  }
};

export default {
  register,
  login,
};
