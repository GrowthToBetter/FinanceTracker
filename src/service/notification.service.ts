import notificationRepository from "../repository/notification.repository.js";
import { ResponseError } from "../error/response.error.js";

const list = async (userId: number) => {
  const notifications = await notificationRepository.findManyByUserId(userId);
  return notifications.map((n) => ({
    id: n.id,
    message: n.message,
    isRead: n.isRead,
    createdAt: n.createdAt,
  }));
};


const markAsRead = async (userId: number, notificationId: number) => {
  const notification = await notificationRepository.findByIdAndUserId(
    notificationId,
    userId,
  );
  if (!notification) {
    return new ResponseError(404, "Notification not found");
  }
  const update = await notificationRepository.markAsRead(notificationId);
  return {
    id: update.id,
    isRead: update.isRead,
  };
};

export default {
  list,
  markAsRead,
};
