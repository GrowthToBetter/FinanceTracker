import { Request, Response, NextFunction } from "express";
import notificationService from "../service/notification.service.js";
import { ResponseError } from "../error/response.error.js";

const parseNotificationId = (idParam: string | string[] | undefined): number => {
  const rawId = Array.isArray(idParam) ? idParam[0] : idParam;
  const id = Number(rawId);
  if (!rawId || isNaN(id) || id <= 0) {
    throw new ResponseError(400, "Invalid notification id");
  }
  return id;
};

const list = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await notificationService.list(req.user!.id);
    res.status(200).json({
      status: 200,
      data: result,
      message: "Get notifications success",
    });
  } catch (error) {
    next(error);
  }
};

const markAsRead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const notificationId = parseNotificationId(req.params.id);
    const result = await notificationService.markAsRead(req.user!.id, notificationId);
    res.status(200).json({
      status: 200,
      data: result,
      message: "Notification marked as read",
    });
  } catch (error) {
    next(error);
  }
};

export default {
  list,
  markAsRead,
};
