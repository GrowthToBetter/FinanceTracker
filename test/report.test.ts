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

describe("Async Export Report API (CSV & JSON)", () => {
  let testUser: any;
  let wallet: any;
  let category: any;

  beforeEach(async () => {
    testUser = await createTestUser();
    wallet = await createTestWallet(testUser.id, "BCA Main", "BANK", 5000000n);
    category = await createTestCategory("Office Supplies");

    await request(app)
      .post("/api/transactions")
      .set("Authorization", "test-token")
      .set("Idempotency-Key", "export-seed-1")
      .send({
        fromWalletId: wallet.id,
        categoryId: category.id,
        type: "EXPENSE",
        amount: 250000,
        note: "Printer ink",
      });
  });

  afterEach(async () => {
    await removeTestCategory("Office Supplies");
    await removeTestUser();
  });

  it("should queue and complete an asynchronous CSV export job", async () => {
    const queueRes = await request(app)
      .post("/api/reports/export")
      .set("Authorization", "test-token")
      .send({
        format: "CSV",
        type: "EXPENSE",
      });

    expect(queueRes.status).toBe(202);
    expect(queueRes.body.data).toHaveProperty("jobId");
    expect(queueRes.body.data.format).toBe("CSV");
    expect(queueRes.body.message).toBe("Export report job queued");

    const jobId = queueRes.body.data.jobId;

    await new Promise((resolve) => setTimeout(resolve, 800));

    const resultRes = await request(app)
      .get(`/api/reports/export/${jobId}`)
      .set("Authorization", "test-token");

    expect(resultRes.status).toBe(200);
    expect(resultRes.body.data.status).toBe("COMPLETED");
    expect(resultRes.body.data.totalRecords).toBe(1);
    expect(typeof resultRes.body.data.content).toBe("string");
    expect(resultRes.body.data.content).toContain(
      "id,date,type,status,amount,fromWallet,toWallet,category,note"
    );
    expect(resultRes.body.data.content).toContain("Printer ink");
  });

  it("should queue and complete an asynchronous JSON export job", async () => {
    const queueRes = await request(app)
      .post("/api/reports/export")
      .set("Authorization", "test-token")
      .send({
        format: "JSON",
      });

    expect(queueRes.status).toBe(202);
    const jobId = queueRes.body.data.jobId;

    await new Promise((resolve) => setTimeout(resolve, 800));

    const resultRes = await request(app)
      .get(`/api/reports/export/${jobId}`)
      .set("Authorization", "test-token");

    expect(resultRes.status).toBe(200);
    expect(resultRes.body.data.status).toBe("COMPLETED");
    expect(resultRes.body.data.totalRecords).toBe(1);
    expect(Array.isArray(resultRes.body.data.content)).toBe(true);
    expect(resultRes.body.data.content[0].amount).toBe(250000);
    expect(resultRes.body.data.content[0].note).toBe("Printer ink");
  });

  it("should return 404 for unknown export jobId", async () => {
    const response = await request(app)
      .get("/api/reports/export/non-existent-job-id")
      .set("Authorization", "test-token");

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Export job not found");
  });
});
