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

describe("Budget API", () => {
  let testUser: any;
  let category: any;
  let wallet: any;

  beforeEach(async () => {
    testUser = await createTestUser();
    category = await createTestCategory("Dining");
    wallet = await createTestWallet(testUser.id, "BCA Account", "BANK", 5000000n);
  });

  afterEach(async () => {
    await removeTestCategory("Dining");
    await removeTestUser();
  });

  describe("POST /api/budgets", () => {
    it("should create budget successfully", async () => {
      const response = await request(app)
        .post("/api/budgets")
        .set("Authorization", "test-token")
        .send({
          categoryId: category.id,
          amount: 3000000,
          month: 11,
          year: 2026,
        });

      expect(response.status).toBe(201);
      expect(response.body.data).toHaveProperty("id");
      expect(response.body.data.categoryId).toBe(category.id);
      expect(response.body.data.amount).toBe(3000000);
      expect(response.body.data.month).toBe(11);
      expect(response.body.data.year).toBe(2026);
      expect(response.body.message).toBe("Create budget success");
    });

    it("should reject creation if budget for category in specified month and year already exists", async () => {
      await request(app)
        .post("/api/budgets")
        .set("Authorization", "test-token")
        .send({
          categoryId: category.id,
          amount: 3000000,
          month: 11,
          year: 2026,
        });

      const response = await request(app)
        .post("/api/budgets")
        .set("Authorization", "test-token")
        .send({
          categoryId: category.id,
          amount: 2000000,
          month: 11,
          year: 2026,
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe(
        "Budget for this category in the specified month and year already exists"
      );
    });

    it("should reject creation for non-existent category", async () => {
      const response = await request(app)
        .post("/api/budgets")
        .set("Authorization", "test-token")
        .send({
          categoryId: 999999,
          amount: 3000000,
          month: 11,
          year: 2026,
        });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Category not found");
    });

    it("should reject creation without auth token", async () => {
      const response = await request(app)
        .post("/api/budgets")
        .send({
          categoryId: category.id,
          amount: 3000000,
          month: 11,
          year: 2026,
        });

      expect(response.status).toBe(401);
    });
  });

  describe("GET /api/budgets", () => {
    it("should list budgets with usedAmount and percentageUsed", async () => {
      const budgetRes = await request(app)
        .post("/api/budgets")
        .set("Authorization", "test-token")
        .send({
          categoryId: category.id,
          amount: 2000000,
          month: 11,
          year: 2026,
        });

      await prismaClient.transaction.create({
        data: {
          userId: testUser.id,
          fromWalletId: wallet.id,
          categoryId: category.id,
          type: "EXPENSE",
          status: "POSTED",
          amount: 1000000n,
          date: new Date(Date.UTC(2026, 10, 15)),
        },
      });

      const response = await request(app)
        .get("/api/budgets")
        .set("Authorization", "test-token");

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThanOrEqual(1);

      const found = response.body.data.find(
        (b: any) => b.id === budgetRes.body.data.id
      );
      expect(found).toBeDefined();
      expect(found.categoryName).toBe("Dining");
      expect(found.amount).toBe(2000000);
      expect(found.usedAmount).toBe(1000000);
      expect(found.percentageUsed).toBe(50);
    });
  });

  describe("GET /api/budgets/:id", () => {
    it("should get budget detail with remainingAmount", async () => {
      const budgetRes = await request(app)
        .post("/api/budgets")
        .set("Authorization", "test-token")
        .send({
          categoryId: category.id,
          amount: 1000000,
          month: 11,
          year: 2026,
        });

      const budgetId = budgetRes.body.data.id;

      await prismaClient.transaction.create({
        data: {
          userId: testUser.id,
          fromWalletId: wallet.id,
          categoryId: category.id,
          type: "EXPENSE",
          status: "POSTED",
          amount: 250000n,
          date: new Date(Date.UTC(2026, 10, 10)),
        },
      });

      const response = await request(app)
        .get(`/api/budgets/${budgetId}`)
        .set("Authorization", "test-token");

      expect(response.status).toBe(200);
      expect(response.body.data.id).toBe(budgetId);
      expect(response.body.data.amount).toBe(1000000);
      expect(response.body.data.usedAmount).toBe(250000);
      expect(response.body.data.remainingAmount).toBe(750000);
      expect(response.body.data.percentageUsed).toBe(25);
    });

    it("should return 404 for non-existent budget", async () => {
      const response = await request(app)
        .get("/api/budgets/999999")
        .set("Authorization", "test-token");

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Budget not found");
    });
  });

  describe("PATCH /api/budgets/:id", () => {
    it("should update budget limit amount successfully", async () => {
      const budgetRes = await request(app)
        .post("/api/budgets")
        .set("Authorization", "test-token")
        .send({
          categoryId: category.id,
          amount: 1000000,
          month: 11,
          year: 2026,
        });

      const budgetId = budgetRes.body.data.id;

      const updateRes = await request(app)
        .patch(`/api/budgets/${budgetId}`)
        .set("Authorization", "test-token")
        .send({
          amount: 1500000,
        });

      expect(updateRes.status).toBe(200);
      expect(updateRes.body.data.amount).toBe(1500000);
      expect(updateRes.body.message).toBe("Update budget success");
    });

    it("should return 404 when updating non-existent budget", async () => {
      const response = await request(app)
        .patch("/api/budgets/999999")
        .set("Authorization", "test-token")
        .send({
          amount: 1500000,
        });

      expect(response.status).toBe(404);
    });
  });

  describe("DELETE /api/budgets/:id", () => {
    it("should delete budget successfully", async () => {
      const budgetRes = await request(app)
        .post("/api/budgets")
        .set("Authorization", "test-token")
        .send({
          categoryId: category.id,
          amount: 1000000,
          month: 11,
          year: 2026,
        });

      const budgetId = budgetRes.body.data.id;

      const deleteRes = await request(app)
        .delete(`/api/budgets/${budgetId}`)
        .set("Authorization", "test-token");

      expect(deleteRes.status).toBe(200);
      expect(deleteRes.body.data.id).toBe(budgetId);
      expect(deleteRes.body.message).toBe("Delete budget success");
    });

    it("should return 404 when deleting non-existent budget", async () => {
      const response = await request(app)
        .delete("/api/budgets/999999")
        .set("Authorization", "test-token");

      expect(response.status).toBe(404);
    });
  });
});
