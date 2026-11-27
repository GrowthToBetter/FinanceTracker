import { Request, Response, NextFunction } from "express";
import dashboardService from "../service/dashboard.service.js";

const getSummary = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await dashboardService.getSummary(req.user!.id);
    res.status(200).json({
      status: 200,
      data: result,
      message: "Get dashboard summary success",
    });
  } catch (error) {
    next(error);
  }
};

const getCashflow = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await dashboardService.getCashflow(req.user!.id);
    res.status(200).json({
      status: 200,
      data: result,
      message: "Get cashflow trends success",
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getSummary,
  getCashflow,
};
