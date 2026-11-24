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

describe("Transaction API", () => {
  let testUser: any;
  let wallet1: any;
  let wallet2: any;
  let category: any;

  beforeEach(async () => {
    testUser = await createTestUser();
    wallet1 = await createTestWallet(testUser.id, "Main Wallet", "BANK", 1000000n);
    wallet2 = await createTestWallet(testUser.id, "Secondary Wallet", "EWALLET", 200000n);
    category = await createTestCategory("Groceries");
  });

  afterEach(async () => {
    await removeTestCategory("Groceries");
    await removeTestUser();
  });

  describe("Idempotency-Key Middleware", () => {
    it("should reject request when Idempotency-Key header is missing", async () => {
      const response = await request(app)
        .post("/api/transactions")
        .set("Authorization", "test-token")
        .send({
          fromWalletId: wallet1.id,
          categoryId: category.id,
          type: "EXPENSE",
          amount: 100000,
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Idempotency-Key header is required");
    });

    it("should replay existing transaction on duplicate Idempotency-Key without double deducting balance", async () => {
      const idempotencyKey = "idemp-key-test-1";

      const firstResponse = await request(app)
        .post("/api/transactions")
        .set("Authorization", "test-token")
        .set("Idempotency-Key", idempotencyKey)
        .send({
          fromWalletId: wallet1.id,
          categoryId: category.id,
          type: "EXPENSE",
          amount: 200000,
        });

      expect(firstResponse.status).toBe(201);
      expect(firstResponse.body.data.amount).toBe(200000);

      const secondResponse = await request(app)
        .post("/api/transactions")
        .set("Authorization", "test-token")
        .set("Idempotency-Key", idempotencyKey)
        .send({
          fromWalletId: wallet1.id,
          categoryId: category.id,
          type: "EXPENSE",
          amount: 200000,
        });

      expect(secondResponse.status).toBe(200);
      expect(secondResponse.body.data.id).toBe(firstResponse.body.data.id);

      const updatedWallet = await prismaClient.wallet.findUnique({
        where: { id: wallet1.id },
      });
      expect(updatedWallet?.balance).toBe(800000n);
    });
  });

  describe("POST /api/transactions", () => {
    it("should create EXPENSE transaction and decrement balance atomically", async () => {
      const response = await request(app)
        .post("/api/transactions")
        .set("Authorization", "test-token")
        .set("Idempotency-Key", "idemp-expense-success")
        .send({
          fromWalletId: wallet1.id,
          categoryId: category.id,
          type: "EXPENSE",
          amount: 300000,
          note: "Supermarket shopping",
        });

      expect(response.status).toBe(201);
      expect(response.body.data).toHaveProperty("id");
      expect(response.body.data.type).toBe("EXPENSE");
      expect(response.body.data.status).toBe("POSTED");
      expect(response.body.data.amount).toBe(300000);

      const updatedWallet = await prismaClient.wallet.findUnique({
        where: { id: wallet1.id },
      });
      expect(updatedWallet?.balance).toBe(700000n);
    });

    it("should create INCOME transaction and increment balance atomically", async () => {
      const response = await request(app)
        .post("/api/transactions")
        .set("Authorization", "test-token")
        .set("Idempotency-Key", "idemp-income-success")
        .send({
          fromWalletId: wallet1.id,
          type: "INCOME",
          amount: 500000,
          note: "Freelance payment",
        });

      expect(response.status).toBe(201);
      expect(response.body.data.type).toBe("INCOME");
      expect(response.body.data.amount).toBe(500000);

      const updatedWallet = await prismaClient.wallet.findUnique({
        where: { id: wallet1.id },
      });
      expect(updatedWallet?.balance).toBe(1500000n);
    });

    it("should reject EXPENSE transaction when balance is insufficient", async () => {
      const response = await request(app)
        .post("/api/transactions")
        .set("Authorization", "test-token")
        .set("Idempotency-Key", "idemp-insufficient-expense")
        .send({
          fromWalletId: wallet1.id,
          type: "EXPENSE",
          amount: 2000000,
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Insufficient wallet balance");

      const untouchedWallet = await prismaClient.wallet.findUnique({
        where: { id: wallet1.id },
      });
      expect(untouchedWallet?.balance).toBe(1000000n);
    });

    it("should reject transaction with non-existent wallet", async () => {
      const response = await request(app)
        .post("/api/transactions")
        .set("Authorization", "test-token")
        .set("Idempotency-Key", "idemp-nonexistent-wallet")
        .send({
          fromWalletId: 999999,
          type: "EXPENSE",
          amount: 10000,
        });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Wallet not found");
    });
  });

  describe("POST /api/transactions/transfer", () => {
    it("should transfer amount atomically between two wallets", async () => {
      const response = await request(app)
        .post("/api/transactions/transfer")
        .set("Authorization", "test-token")
        .set("Idempotency-Key", "idemp-transfer-success")
        .send({
          fromWalletId: wallet1.id,
          toWalletId: wallet2.id,
          amount: 400000,
          note: "Top up secondary wallet",
        });

      expect(response.status).toBe(201);
      expect(response.body.data.type).toBe("TRANSFER");
      expect(response.body.data.amount).toBe(400000);
      expect(response.body.data.fromWalletId).toBe(wallet1.id);
      expect(response.body.data.toWalletId).toBe(wallet2.id);

      const updatedWallet1 = await prismaClient.wallet.findUnique({
        where: { id: wallet1.id },
      });
      const updatedWallet2 = await prismaClient.wallet.findUnique({
        where: { id: wallet2.id },
      });

      expect(updatedWallet1?.balance).toBe(600000n);
      expect(updatedWallet2?.balance).toBe(600000n);
    });

    it("should reject transfer when source wallet has insufficient balance", async () => {
      const response = await request(app)
        .post("/api/transactions/transfer")
        .set("Authorization", "test-token")
        .set("Idempotency-Key", "idemp-transfer-insufficient")
        .send({
          fromWalletId: wallet1.id,
          toWalletId: wallet2.id,
          amount: 1500000,
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Insufficient wallet balance");

      const untouchedWallet1 = await prismaClient.wallet.findUnique({
        where: { id: wallet1.id },
      });
      const untouchedWallet2 = await prismaClient.wallet.findUnique({
        where: { id: wallet2.id },
      });

      expect(untouchedWallet1?.balance).toBe(1000000n);
      expect(untouchedWallet2?.balance).toBe(200000n);
    });

    it("should reject transfer when source and destination are the same", async () => {
      const response = await request(app)
        .post("/api/transactions/transfer")
        .set("Authorization", "test-token")
        .set("Idempotency-Key", "idemp-transfer-same")
        .send({
          fromWalletId: wallet1.id,
          toWalletId: wallet1.id,
          amount: 100000,
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe(
        "Source and destination wallet cannot be the same"
      );
    });
  });

  describe("Race condition guard on transfer", () => {
    it("should prevent double spending under concurrent transfers", async () => {
      const smallWallet = await createTestWallet(
        testUser.id,
        "Small Wallet",
        "BANK",
        500000n
      );

      const request1 = request(app)
        .post("/api/transactions/transfer")
        .set("Authorization", "test-token")
        .set("Idempotency-Key", "concurrent-tx-1")
        .send({
          fromWalletId: smallWallet.id,
          toWalletId: wallet2.id,
          amount: 300000,
        });

      const request2 = request(app)
        .post("/api/transactions/transfer")
        .set("Authorization", "test-token")
        .set("Idempotency-Key", "concurrent-tx-2")
        .send({
          fromWalletId: smallWallet.id,
          toWalletId: wallet2.id,
          amount: 300000,
        });

      const [res1, res2] = await Promise.all([request1, request2]);

      const successCount = [res1, res2].filter((r) => r.status === 201).length;
      const failCount = [res1, res2].filter(
        (r) => r.status === 400 && r.body.message === "Insufficient wallet balance"
      ).length;

      expect(successCount).toBe(1);
      expect(failCount).toBe(1);

      const updatedSmallWallet = await prismaClient.wallet.findUnique({
        where: { id: smallWallet.id },
      });
      expect(updatedSmallWallet?.balance).toBe(200000n);
    });
  });

  describe("GET /api/transactions", () => {
    beforeEach(async () => {
      await request(app)
        .post("/api/transactions")
        .set("Authorization", "test-token")
        .set("Idempotency-Key", "list-seed-1")
        .send({
          fromWalletId: wallet1.id,
          categoryId: category.id,
          type: "EXPENSE",
          amount: 100000,
        });

      await request(app)
        .post("/api/transactions/transfer")
        .set("Authorization", "test-token")
        .set("Idempotency-Key", "list-seed-2")
        .send({
          fromWalletId: wallet1.id,
          toWalletId: wallet2.id,
          amount: 50000,
        });
    });

    it("should list transactions with pagination", async () => {
      const response = await request(app)
        .get("/api/transactions?page=1&size=10")
        .set("Authorization", "test-token");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("data");
      expect(response.body).toHaveProperty("paging");
      expect(response.body.data.length).toBe(2);
      expect(response.body.paging.total_items).toBe(2);
    });

    it("should filter transactions by type", async () => {
      const response = await request(app)
        .get("/api/transactions?type=TRANSFER")
        .set("Authorization", "test-token");

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].type).toBe("TRANSFER");
    });
  });

  describe("GET /api/transactions/:id", () => {
    it("should get transaction detail successfully", async () => {
      const createRes = await request(app)
        .post("/api/transactions")
        .set("Authorization", "test-token")
        .set("Idempotency-Key", "detail-test-1")
        .send({
          fromWalletId: wallet1.id,
          categoryId: category.id,
          type: "EXPENSE",
          amount: 50000,
        });

      const txId = createRes.body.data.id;

      const response = await request(app)
        .get(`/api/transactions/${txId}`)
        .set("Authorization", "test-token");

      expect(response.status).toBe(200);
      expect(response.body.data.id).toBe(txId);
      expect(response.body.data.amount).toBe(50000);
    });

    it("should return 404 for non-existent transaction", async () => {
      const response = await request(app)
        .get("/api/transactions/999999")
        .set("Authorization", "test-token");

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Transaction not found");
    });
  });

  describe("POST /api/transactions/:id/void", () => {
    it("should void EXPENSE transaction and refund balance", async () => {
      const createRes = await request(app)
        .post("/api/transactions")
        .set("Authorization", "test-token")
        .set("Idempotency-Key", "void-expense-1")
        .send({
          fromWalletId: wallet1.id,
          type: "EXPENSE",
          amount: 250000,
        });

      const txId = createRes.body.data.id;

      const voidRes = await request(app)
        .post(`/api/transactions/${txId}/void`)
        .set("Authorization", "test-token");

      expect(voidRes.status).toBe(200);
      expect(voidRes.body.data.id).toBe(txId);
      expect(voidRes.body.data.status).toBe("VOIDED");

      const updatedWallet = await prismaClient.wallet.findUnique({
        where: { id: wallet1.id },
      });
      expect(updatedWallet?.balance).toBe(1000000n);
    });

    it("should void TRANSFER transaction and reverse both balances", async () => {
      const transferRes = await request(app)
        .post("/api/transactions/transfer")
        .set("Authorization", "test-token")
        .set("Idempotency-Key", "void-transfer-1")
        .send({
          fromWalletId: wallet1.id,
          toWalletId: wallet2.id,
          amount: 200000,
        });

      const txId = transferRes.body.data.id;

      const voidRes = await request(app)
        .post(`/api/transactions/${txId}/void`)
        .set("Authorization", "test-token");

      expect(voidRes.status).toBe(200);
      expect(voidRes.body.data.status).toBe("VOIDED");

      const updatedWallet1 = await prismaClient.wallet.findUnique({
        where: { id: wallet1.id },
      });
      const updatedWallet2 = await prismaClient.wallet.findUnique({
        where: { id: wallet2.id },
      });

      expect(updatedWallet1?.balance).toBe(1000000n);
      expect(updatedWallet2?.balance).toBe(200000n);
    });

    it("should reject voiding an already voided transaction", async () => {
      const createRes = await request(app)
        .post("/api/transactions")
        .set("Authorization", "test-token")
        .set("Idempotency-Key", "void-repeat-1")
        .send({
          fromWalletId: wallet1.id,
          type: "EXPENSE",
          amount: 100000,
        });

      const txId = createRes.body.data.id;

      await request(app)
        .post(`/api/transactions/${txId}/void`)
        .set("Authorization", "test-token");

      const repeatRes = await request(app)
        .post(`/api/transactions/${txId}/void`)
        .set("Authorization", "test-token");

      expect(repeatRes.status).toBe(400);
      expect(repeatRes.body.message).toBe("Transaction is already voided");
    });
  });
});
