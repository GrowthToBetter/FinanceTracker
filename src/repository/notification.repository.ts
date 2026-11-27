import { prismaClient } from "../web/database.js";
import { Notification } from "@prisma/client";

const create = async (userId: number, message: string): Promise<Notification> => {
  return prismaClient.notification.create({
    data: {
      userId,
      message,
      isRead: false,
    },
  });
};

const findManyByUserId = async (userId: number): Promise<Notification[]> => {
  return prismaClient.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
};

const findByIdAndUserId = async (
  id: number,
  userId: number
): Promise<Notification | null> => {
  return prismaClient.notification.findFirst({
    where: { id, userId },
  });
};

const markAsRead = async (id: number): Promise<Notification> => {
  return prismaClient.notification.update({
    where: { id },
    data: { isRead: true },
  });
};

export default {
  create,
  findManyByUserId,
  findByIdAndUserId,
  markAsRead,
};
