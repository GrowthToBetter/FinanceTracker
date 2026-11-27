import { Request, Response, NextFunction } from "express";
import reportService from "../service/report.service.js";
import { ResponseError } from "../error/response.error.js";

const requestExport = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const payload = {
      ...req.query,
      ...req.body,
    };
    const result = await reportService.requestExport(req.user!.id, payload);
    res.status(202).json({
      status: 202,
      data: result,
      message: "Export report job queued",
    });
  } catch (error) {
    next(error);
  }
};

const getExportJob = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const rawJobId = req.params.jobId;
    const jobId = Array.isArray(rawJobId) ? rawJobId[0] : rawJobId;
    if (!jobId || jobId.trim().length === 0) {
      throw new ResponseError(400, "Invalid export job id");
    }

    const result = await reportService.getExportJob(req.user!.id, jobId);
    res.status(200).json({
      status: 200,
      data: result,
      message: "Get export report success",
    });
  } catch (error) {
    next(error);
  }
};

export default {
  requestExport,
  getExportJob,
};
