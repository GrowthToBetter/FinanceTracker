import { describe, it, expect, beforeEach, afterEach } from "@jest/globals";
import request from "supertest";
import { app } from "../src/web/main.js";
import {
  createTestUser,
  removeTestUser,
  createTestWallet,
  createTestCategory,
  removeTestCategory,
} from "./util-test.js";
import { prismaClient } from "../src/web/database.js";

describe("Notification API & Threshold Alert", () => {
  let testUser: any;
  let category: any;
  let wallet: any;

  beforeEach(async () => {
    testUser = await createTestUser();
    category = await createTestCategory("Groceries");
    wallet = await createTestWallet(testUser.id, "Main Wallet", "BANK", 5000000n);
  });

  afterEach(async () => {
    await removeTestCategory("Groceries");
    await removeTestUser();
  });

  describe("GET /api/notifications", () => {
    it("should list notifications for current user", async () => {
      await prismaClient.notification.createMany({
        data: [
          {
            userId: testUser.id,
            message: "Notification 1",
            isRead: false,
          },
          {
            userId: testUser.id,
            message: "Notification 2",
            isRead: true,
          },
        ],
      });

      const response = await request(app)
        .get("/api/notifications")
        .set("Authorization", "test-token");

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(2);
      expect(response.body.message).toBe("Get notifications success");
    });

    it("should return 401 without auth token", async () => {
      const response = await request(app).get("/api/notifications");
      expect(response.status).toBe(401);
    });
  });

  describe("PATCH /api/notifications/:id/read", () => {
    it("should mark notification as read", async () => {
      const notification = await prismaClient.notification.create({
        data: {
          userId: testUser.id,
          message: "Test Notification",
          isRead: false,
        },
      });

      const response = await request(app)
        .patch(`/api/notifications/${notification.id}/read`)
        .set("Authorization", "test-token");

      expect(response.status).toBe(200);
      expect(response.body.data.id).toBe(notification.id);
      expect(response.body.data.isRead).toBe(true);
      expect(response.body.message).toBe("Notification marked as read");

      const inDb = await prismaClient.notification.findUnique({
        where: { id: notification.id },
      });
      expect(inDb?.isRead).toBe(true);
    });

    it("should return 404 for non-existent notification", async () => {
      const response = await request(app)
        .patch("/api/notifications/999999/read")
        .set("Authorization", "test-token");

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Notification not found");
    });
  });

  describe("Budget Threshold Alert Trigger", () => {
    it("should trigger notification alert when expense reaches >=80% of budget", async () => {
      const now = new Date();
      const currentMonth = now.getUTCMonth() + 1;
      const currentYear = now.getUTCFullYear();

      await prismaClient.budget.create({
        data: {
          userId: testUser.id,
          categoryId: category.id,
          amount: 1000000n,
          month: currentMonth,
          year: currentYear,
        },
      });

      await request(app)
        .post("/api/transactions")
        .set("Authorization", "test-token")
        .set("Idempotency-Key", "threshold-alert-85")
        .send({
          fromWalletId: wallet.id,
          categoryId: category.id,
          type: "EXPENSE",
          amount: 850000,
        });

      await new Promise((resolve) => setTimeout(resolve, 800));

      const notifications = await prismaClient.notification.findMany({
        where: { userId: testUser.id },
      });

      expect(notifications.length).toBeGreaterThanOrEqual(1);
      const alert = notifications.find((n) => n.message.includes("85.00%"));
      expect(alert).toBeDefined();
    });
  });
});
