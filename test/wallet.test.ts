import { describe, it, expect, beforeEach, afterEach } from "@jest/globals";
import request from "supertest";
import { app } from "../src/web/main.js";
import { createTestUser, removeTestUser, createTestWallet } from "./util-test.js";

describe("Wallet API", () => {
  let testUser: any;

  beforeEach(async () => {
    testUser = await createTestUser();
  });

  afterEach(async () => {
    await removeTestUser();
  });

  describe("POST /api/wallets", () => {
    it("should create wallet successfully", async () => {
      const response = await request(app)
        .post("/api/wallets")
        .set("Authorization", "test-token")
        .send({
          name: "BCA Main Account",
          type: "BANK",
          balance: 10000000,
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("data");
      expect(response.body.data).toHaveProperty("name", "BCA Main Account");
      expect(response.body.data).toHaveProperty("type", "BANK");
      expect(response.body.data).toHaveProperty("balance", 10000000);
    });

    it("should reject wallet creation if unauthorized", async () => {
      const response = await request(app)
        .post("/api/wallets")
        .send({
          name: "BCA Main Account",
          type: "BANK",
        });

      expect(response.status).toBe(401);
    });

    it("should reject wallet creation with invalid type", async () => {
      const response = await request(app)
        .post("/api/wallets")
        .set("Authorization", "test-token")
        .send({
          name: "BCA Main Account",
          type: "CRYPTO",
        });

      expect(response.status).toBe(400);
    });
  });

  describe("GET /api/wallets", () => {
    it("should list all user wallets", async () => {
      await createTestWallet(testUser.id, "Wallet 1", "CASH", 500000n);
      await createTestWallet(testUser.id, "Wallet 2", "BANK", 1000000n);

      const response = await request(app)
        .get("/api/wallets")
        .set("Authorization", "test-token");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("data");
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(2);
    });

    it("should reject if unauthorized", async () => {
      const response = await request(app).get("/api/wallets");
      expect(response.status).toBe(401);
    });
  });

  describe("GET /api/wallets/:id", () => {
    it("should get wallet detail by ID", async () => {
      const wallet = await createTestWallet(testUser.id, "Wallet 1", "CASH", 500000n);

      const response = await request(app)
        .get(`/api/wallets/${wallet.id}`)
        .set("Authorization", "test-token");

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty("id", wallet.id);
      expect(response.body.data).toHaveProperty("name", "Wallet 1");
    });

    it("should return 404 if wallet not found", async () => {
      const response = await request(app)
        .get("/api/wallets/999999")
        .set("Authorization", "test-token");

      expect(response.status).toBe(404);
    });
  });

  describe("PATCH /api/wallets/:id", () => {
    it("should update wallet successfully", async () => {
      const wallet = await createTestWallet(testUser.id, "Wallet Old", "CASH");

      const response = await request(app)
        .patch(`/api/wallets/${wallet.id}`)
        .set("Authorization", "test-token")
        .send({
          name: "Wallet Updated",
          type: "BANK",
        });

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty("name", "Wallet Updated");
      expect(response.body.data).toHaveProperty("type", "BANK");
    });

    it("should return 404 if wallet not found", async () => {
      const response = await request(app)
        .patch("/api/wallets/999999")
        .set("Authorization", "test-token")
        .send({
          name: "Wallet Updated",
        });

      expect(response.status).toBe(404);
    });
  });

  describe("DELETE /api/wallets/:id", () => {
    it("should delete wallet with zero balance", async () => {
      const wallet = await createTestWallet(testUser.id, "Empty Wallet", "CASH", 0n);

      const response = await request(app)
        .delete(`/api/wallets/${wallet.id}`)
        .set("Authorization", "test-token");

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty("id", wallet.id);
    });

    it("should reject delete if balance is non-zero", async () => {
      const wallet = await createTestWallet(testUser.id, "Active Wallet", "BANK", 1000000n);

      const response = await request(app)
        .delete(`/api/wallets/${wallet.id}`)
        .set("Authorization", "test-token");

      expect(response.status).toBe(400);
    });
  });
});
