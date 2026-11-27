import { describe, it, expect, beforeEach, afterEach } from "@jest/globals";
import request from "supertest";
import { app } from "../src/web/main.js";
import { removeTestUser, removeTestCategory } from "./util-test.js";

describe("Automated End-to-End (E2E) Finance Tracker Flow", () => {
  const e2eEmail = "e2e.user@example.com";
  const e2eCategoryName = "E2E Living Expenses";

  beforeEach(async () => {
    await removeTestCategory(e2eCategoryName);
    await removeTestUser(e2eEmail);
  });

  afterEach(async () => {
    await removeTestCategory(e2eCategoryName);
    await removeTestUser(e2eEmail);
  });

  it("should execute full user financial lifecycle from registration to export and logout", async () => {
    const healthRes = await request(app).get("/health");
    expect(healthRes.status).toBe(200);

    const docsRes = await request(app).get("/api-docs.json");
    expect(docsRes.status).toBe(200);
    expect(docsRes.body.openapi).toBe("3.0.0");

    const registerRes = await request(app).post("/api/auth/register").send({
      name: "E2E Tester",
      email: e2eEmail,
      password: "password123",
    });
    expect(registerRes.status).toBe(201);

    const loginRes = await request(app).post("/api/auth/login").send({
      email: e2eEmail,
      password: "password123",
    });
    expect(loginRes.status).toBe(200);
    const token = loginRes.body.data.token;

    const meRes = await request(app)
      .get("/api/auth/me")
      .set("Authorization", token);
    expect(meRes.status).toBe(200);
    expect(meRes.body.data.email).toBe(e2eEmail);

    const bankWalletRes = await request(app)
      .post("/api/wallets")
      .set("Authorization", token)
      .send({
        name: "Primary Bank",
        type: "BANK",
        balance: 10000000,
      });
    expect(bankWalletRes.status).toBe(201);
    const bankWalletId = bankWalletRes.body.data.id;

    const savingsWalletRes = await request(app)
      .post("/api/wallets")
      .set("Authorization", token)
      .send({
        name: "Goal Savings",
        type: "SAVINGS",
        balance: 1000000,
      });
    expect(savingsWalletRes.status).toBe(201);
    const savingsWalletId = savingsWalletRes.body.data.id;

    const categoryRes = await request(app)
      .post("/api/categories")
      .set("Authorization", token)
      .send({
        name: e2eCategoryName,
      });
    expect(categoryRes.status).toBe(201);
    const categoryId = categoryRes.body.data.id;

    const now = new Date();
    const budgetRes = await request(app)
      .post("/api/budgets")
      .set("Authorization", token)
      .send({
        categoryId,
        amount: 2000000,
        month: now.getUTCMonth() + 1,
        year: now.getUTCFullYear(),
      });
    expect(budgetRes.status).toBe(201);

    const goalRes = await request(app)
      .post("/api/savings-goals")
      .set("Authorization", token)
      .send({
        name: "MacBook Pro",
        targetAmount: 20000000,
        walletId: savingsWalletId,
      });
    expect(goalRes.status).toBe(201);
    expect(goalRes.body.data.currentAmount).toBe(1000000);

    const expenseRes = await request(app)
      .post("/api/transactions")
      .set("Authorization", token)
      .set("Idempotency-Key", "e2e-tx-exp-1")
      .send({
        fromWalletId: bankWalletId,
        categoryId,
        type: "EXPENSE",
        amount: 1700000,
        note: "Monthly rent and utilities",
      });
    expect(expenseRes.status).toBe(201);

    const transferRes = await request(app)
      .post("/api/transactions/transfer")
      .set("Authorization", token)
      .set("Idempotency-Key", "e2e-tx-trf-1")
      .send({
        fromWalletId: bankWalletId,
        toWalletId: savingsWalletId,
        amount: 1000000,
        note: "Monthly savings deposit",
      });
    expect(transferRes.status).toBe(201);

    await new Promise((resolve) => setTimeout(resolve, 600));

    const notifRes = await request(app)
      .get("/api/notifications")
      .set("Authorization", token);
    expect(notifRes.status).toBe(200);
    expect(notifRes.body.data.length).toBeGreaterThanOrEqual(1);

    const dashboardRes = await request(app)
      .get("/api/dashboard/summary")
      .set("Authorization", token);
    expect(dashboardRes.status).toBe(200);
    expect(dashboardRes.body.data.totalBalance).toBe(9300000);
    expect(dashboardRes.body.data.monthlyExpense).toBe(1700000);

    const exportQueueRes = await request(app)
      .post("/api/reports/export")
      .set("Authorization", token)
      .send({ format: "CSV" });
    expect(exportQueueRes.status).toBe(202);

    await new Promise((resolve) => setTimeout(resolve, 600));

    const exportDetailRes = await request(app)
      .get(`/api/reports/export/${exportQueueRes.body.data.jobId}`)
      .set("Authorization", token);
    expect(exportDetailRes.status).toBe(200);
    expect(exportDetailRes.body.data.status).toBe("COMPLETED");
    expect(exportDetailRes.body.data.totalRecords).toBe(2);

    const logoutRes = await request(app)
      .delete("/api/auth/logout")
      .set("Authorization", token);
    expect(logoutRes.status).toBe(200);
  });
});
