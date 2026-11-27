import { describe, it, expect, beforeEach, afterEach } from "@jest/globals";
import request from "supertest";
import { app } from "../src/web/main.js";
import {
  createTestUser,
  removeTestUser,
  createTestWallet,
} from "./util-test.js";

describe("Savings Goals API", () => {
  let testUser: any;
  let savingsWallet: any;

  beforeEach(async () => {
    testUser = await createTestUser();
    savingsWallet = await createTestWallet(
      testUser.id,
      "Emergency Savings",
      "SAVINGS",
      2500000n
    );
  });

  afterEach(async () => {
    await removeTestUser();
  });

  describe("POST /api/savings-goals", () => {
    it("should create a savings goal with progress metrics", async () => {
      const response = await request(app)
        .post("/api/savings-goals")
        .set("Authorization", "test-token")
        .send({
          name: "Emergency Fund",
          targetAmount: 10000000,
          currentAmount: 2500000,
          walletId: savingsWallet.id,
          deadline: "2026-12-31T23:59:59.000Z",
        });

      expect(response.status).toBe(201);
      expect(response.body.data.name).toBe("Emergency Fund");
      expect(response.body.data.targetAmount).toBe(10000000);
      expect(response.body.data.currentAmount).toBe(2500000);
      expect(response.body.data.remainingAmount).toBe(7500000);
      expect(response.body.data.percentageAchieved).toBe(25);
      expect(response.body.data.isAchieved).toBe(false);
      expect(response.body.message).toBe("Create savings goal success");
    });

    it("should initialize currentAmount from linked wallet balance when omitted", async () => {
      const response = await request(app)
        .post("/api/savings-goals")
        .set("Authorization", "test-token")
        .send({
          name: "New Laptop",
          targetAmount: 5000000,
          walletId: savingsWallet.id,
        });

      expect(response.status).toBe(201);
      expect(response.body.data.currentAmount).toBe(2500000);
      expect(response.body.data.percentageAchieved).toBe(50);
    });
  });

  describe("GET /api/savings-goals & GET /api/savings-goals/:id", () => {
    it("should list and get savings goal detail", async () => {
      const createRes = await request(app)
        .post("/api/savings-goals")
        .set("Authorization", "test-token")
        .send({
          name: "Vacation Fund",
          targetAmount: 4000000,
          currentAmount: 1000000,
        });

      const goalId = createRes.body.data.id;

      const listRes = await request(app)
        .get("/api/savings-goals")
        .set("Authorization", "test-token");

      expect(listRes.status).toBe(200);
      expect(listRes.body.data.length).toBe(1);
      expect(listRes.body.data[0].percentageAchieved).toBe(25);

      const detailRes = await request(app)
        .get(`/api/savings-goals/${goalId}`)
        .set("Authorization", "test-token");

      expect(detailRes.status).toBe(200);
      expect(detailRes.body.data.id).toBe(goalId);
      expect(detailRes.body.data.remainingAmount).toBe(3000000);
    });
  });

  describe("PATCH /api/savings-goals/:id & DELETE /api/savings-goals/:id", () => {
    it("should update savings goal progress and mark isAchieved when target reached", async () => {
      const createRes = await request(app)
        .post("/api/savings-goals")
        .set("Authorization", "test-token")
        .send({
          name: "Camera Upgrade",
          targetAmount: 5000000,
          currentAmount: 2000000,
        });

      const goalId = createRes.body.data.id;

      const updateRes = await request(app)
        .patch(`/api/savings-goals/${goalId}`)
        .set("Authorization", "test-token")
        .send({
          currentAmount: 5000000,
        });

      expect(updateRes.status).toBe(200);
      expect(updateRes.body.data.currentAmount).toBe(5000000);
      expect(updateRes.body.data.remainingAmount).toBe(0);
      expect(updateRes.body.data.percentageAchieved).toBe(100);
      expect(updateRes.body.data.isAchieved).toBe(true);

      const deleteRes = await request(app)
        .delete(`/api/savings-goals/${goalId}`)
        .set("Authorization", "test-token");

      expect(deleteRes.status).toBe(200);
      expect(deleteRes.body.data.id).toBe(goalId);
    });
  });
});
