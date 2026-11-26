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
import {
  getCache,
  getDashboardSummaryCacheKey,
  getDashboardCashflowCacheKey,
} from "../src/web/redis.js";

describe("Dashboard API & Redis Caching", () => {
  let testUser: any;
  let wallet1: any;
  let wallet2: any;
  let category: any;

  beforeEach(async () => {
    testUser = await createTestUser();
    wallet1 = await createTestWallet(testUser.id, "BCA Payroll Account", "BANK", 10000000n);
    wallet2 = await createTestWallet(testUser.id, "Cash Wallet", "CASH", 1000000n);
    category = await createTestCategory("Groceries");
  });

  afterEach(async () => {
    await removeTestCategory("Groceries");
    await removeTestUser();
  });

  describe("GET /api/dashboard/summary", () => {
    it("should return aggregated dashboard summary and cache it in Redis", async () => {
      const now = new Date();
      const currentMonth = now.getUTCMonth() + 1;
      const currentYear = now.getUTCFullYear();

      await prismaClient.budget.create({
        data: {
          userId: testUser.id,
          categoryId: category.id,
          amount: 2000000n,
          month: currentMonth,
          year: currentYear,
        },
      });

      await request(app)
        .post("/api/transactions")
        .set("Authorization", "test-token")
        .set("Idempotency-Key", "dash-sum-inc-1")
        .send({
          fromWalletId: wallet1.id,
          type: "INCOME",
          amount: 5000000,
        });

      await request(app)
        .post("/api/transactions")
        .set("Authorization", "test-token")
        .set("Idempotency-Key", "dash-sum-exp-1")
        .send({
          fromWalletId: wallet1.id,
          categoryId: category.id,
          type: "EXPENSE",
          amount: 750000,
        });

      const response = await request(app)
        .get("/api/dashboard/summary")
        .set("Authorization", "test-token");

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Get dashboard summary success");
      expect(response.body.data.totalBalance).toBe(15250000);
      expect(response.body.data.monthlyIncome).toBe(5000000);
      expect(response.body.data.monthlyExpense).toBe(750000);
      expect(response.body.data.walletsCount).toBe(2);
      expect(response.body.data.activeBudgetsCount).toBe(1);
      expect(Array.isArray(response.body.data.wallets)).toBe(true);
      expect(response.body.data.wallets.length).toBe(2);

      const cachedSummary = await getCache<any>(
        getDashboardSummaryCacheKey(testUser.id)
      );
      expect(cachedSummary).not.toBeNull();
      expect(cachedSummary.totalBalance).toBe(15250000);
    });

    it("should serve dashboard summary from Redis cache on subsequent request", async () => {
      const firstRes = await request(app)
        .get("/api/dashboard/summary")
        .set("Authorization", "test-token");

      expect(firstRes.status).toBe(200);
      expect(firstRes.body.data.totalBalance).toBe(11000000);

      await prismaClient.wallet.update({
        where: { id: wallet1.id },
        data: { balance: 99000000n },
      });

      const cachedRes = await request(app)
        .get("/api/dashboard/summary")
        .set("Authorization", "test-token");

      expect(cachedRes.status).toBe(200);
      expect(cachedRes.body.data.totalBalance).toBe(11000000);
    });

    it("should return 401 without auth token", async () => {
      const response = await request(app).get("/api/dashboard/summary");
      expect(response.status).toBe(401);
    });
  });

  describe("GET /api/dashboard/cashflow", () => {
    it("should return daily cashflow trends and cache in Redis", async () => {
      await prismaClient.transaction.createMany({
        data: [
          {
            userId: testUser.id,
            fromWalletId: wallet1.id,
            categoryId: category.id,
            type: "EXPENSE",
            status: "POSTED",
            amount: 150000n,
            date: new Date("2026-11-21T10:00:00.000Z"),
          },
          {
            userId: testUser.id,
            fromWalletId: wallet1.id,
            type: "INCOME",
            status: "POSTED",
            amount: 15000000n,
            date: new Date("2026-11-22T09:00:00.000Z"),
          },
          {
            userId: testUser.id,
            fromWalletId: wallet1.id,
            categoryId: category.id,
            type: "EXPENSE",
            status: "POSTED",
            amount: 600000n,
            date: new Date("2026-11-22T14:00:00.000Z"),
          },
        ],
      });

      const response = await request(app)
        .get("/api/dashboard/cashflow")
        .set("Authorization", "test-token");

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Get cashflow trends success");
      expect(response.body.data.length).toBe(2);
      expect(response.body.data[0]).toEqual({
        date: "2026-11-21",
        income: 0,
        expense: 150000,
        net: -150000,
      });
      expect(response.body.data[1]).toEqual({
        date: "2026-11-22",
        income: 15000000,
        expense: 600000,
        net: 14400000,
      });

      const cachedCashflow = await getCache<any>(
        getDashboardCashflowCacheKey(testUser.id)
      );
      expect(cachedCashflow).not.toBeNull();
      expect(cachedCashflow.length).toBe(2);
    });

    it("should return 401 without auth token", async () => {
      const response = await request(app).get("/api/dashboard/cashflow");
      expect(response.status).toBe(401);
    });
  });

  describe("Cache Invalidation on Transaction / Transfer / Void", () => {
    it("should invalidate dashboard cache on new transaction creation", async () => {
      const initialRes = await request(app)
        .get("/api/dashboard/summary")
        .set("Authorization", "test-token");
      expect(initialRes.body.data.totalBalance).toBe(11000000);

      await request(app)
        .post("/api/transactions")
        .set("Authorization", "test-token")
        .set("Idempotency-Key", "cache-inv-create-1")
        .send({
          fromWalletId: wallet1.id,
          categoryId: category.id,
          type: "EXPENSE",
          amount: 500000,
        });

      const cachedAfterCreate = await getCache<any>(
        getDashboardSummaryCacheKey(testUser.id)
      );
      expect(cachedAfterCreate).toBeNull();

      const updatedRes = await request(app)
        .get("/api/dashboard/summary")
        .set("Authorization", "test-token");
      expect(updatedRes.body.data.totalBalance).toBe(10500000);
      expect(updatedRes.body.data.monthlyExpense).toBe(500000);
    });

    it("should invalidate dashboard cache on transfer transaction", async () => {
      await request(app)
        .get("/api/dashboard/summary")
        .set("Authorization", "test-token");

      const cachedBefore = await getCache<any>(
        getDashboardSummaryCacheKey(testUser.id)
      );
      expect(cachedBefore).not.toBeNull();

      await request(app)
        .post("/api/transactions/transfer")
        .set("Authorization", "test-token")
        .set("Idempotency-Key", "cache-inv-transfer-1")
        .send({
          fromWalletId: wallet1.id,
          toWalletId: wallet2.id,
          amount: 2000000,
        });

      const cachedAfterTransfer = await getCache<any>(
        getDashboardSummaryCacheKey(testUser.id)
      );
      expect(cachedAfterTransfer).toBeNull();

      const updatedRes = await request(app)
        .get("/api/dashboard/summary")
        .set("Authorization", "test-token");

      const updatedWallet1 = updatedRes.body.data.wallets.find(
        (w: any) => w.id === wallet1.id
      );
      const updatedWallet2 = updatedRes.body.data.wallets.find(
        (w: any) => w.id === wallet2.id
      );
      expect(updatedWallet1.balance).toBe(8000000);
      expect(updatedWallet2.balance).toBe(3000000);
    });

    it("should invalidate dashboard cache on transaction void", async () => {
      const txRes = await request(app)
        .post("/api/transactions")
        .set("Authorization", "test-token")
        .set("Idempotency-Key", "cache-inv-void-1")
        .send({
          fromWalletId: wallet1.id,
          categoryId: category.id,
          type: "EXPENSE",
          amount: 1000000,
        });

      const txId = txRes.body.data.id;

      const summaryBeforeVoid = await request(app)
        .get("/api/dashboard/summary")
        .set("Authorization", "test-token");
      expect(summaryBeforeVoid.body.data.totalBalance).toBe(10000000);
      expect(summaryBeforeVoid.body.data.monthlyExpense).toBe(1000000);

      await request(app)
        .post(`/api/transactions/${txId}/void`)
        .set("Authorization", "test-token");

      const cachedAfterVoid = await getCache<any>(
        getDashboardSummaryCacheKey(testUser.id)
      );
      expect(cachedAfterVoid).toBeNull();

      const summaryAfterVoid = await request(app)
        .get("/api/dashboard/summary")
        .set("Authorization", "test-token");
      expect(summaryAfterVoid.body.data.totalBalance).toBe(11000000);
      expect(summaryAfterVoid.body.data.monthlyExpense).toBe(0);
    });
  });
});
