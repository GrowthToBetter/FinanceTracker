import { describe, it, expect, beforeEach, afterEach } from "@jest/globals";
import request from "supertest";
import { app } from "../src/web/main.js";
import { createTestUser, removeTestUser } from "./util-test.js";

describe("POST /api/auth/register", () => {
  afterEach(async () => {
    await removeTestUser();
  });

  it("should register a new user successfully", async () => {
    const response = await request(app).post("/api/auth/register").send({
      name: "Test User",
      email: "testuser@example.com",
      password: "password123",
    });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("data");
    expect(response.body.data).toHaveProperty("email", "testuser@example.com");
    expect(response.body.data).toHaveProperty("name", "Test User");
    expect(response.body.data).not.toHaveProperty("password");
  });

  it("should reject registration if email already exists", async () => {
    await createTestUser();

    const response = await request(app).post("/api/auth/register").send({
      name: "Test User",
      email: "testuser@example.com",
      password: "password123",
    });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("message");
  });

  it("should reject registration if payload is invalid", async () => {
    const response = await request(app).post("/api/auth/register").send({
      name: "",
      email: "not-an-email",
      password: "123",
    });

    expect(response.status).toBe(400);
  });
});

describe("POST /api/auth/login", () => {
  beforeEach(async () => {
    await createTestUser();
  });

  afterEach(async () => {
    await removeTestUser();
  });

  it("should login successfully with valid credentials", async () => {
    const response = await request(app).post("/api/auth/login").send({
      email: "testuser@example.com",
      password: "password123",
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("data");
    expect(response.body.data).toHaveProperty("token");
  });

  it("should reject login with wrong password", async () => {
    const response = await request(app).post("/api/auth/login").send({
      email: "testuser@example.com",
      password: "wrongpassword",
    });

    expect(response.status).toBe(401);
  });

  it("should reject login with non-existent email", async () => {
    const response = await request(app).post("/api/auth/login").send({
      email: "nonexistent@example.com",
      password: "password123",
    });

    expect(response.status).toBe(401);
  });
});

describe("GET /api/auth/me & DELETE /api/auth/logout", () => {
  beforeEach(async () => {
    await createTestUser();
  });

  afterEach(async () => {
    await removeTestUser();
  });

  it("should get current authenticated user profile", async () => {
    const response = await request(app)
      .get("/api/auth/me")
      .set("Authorization", "test-token");

    expect(response.status).toBe(200);
    expect(response.body.data.email).toBe("testuser@example.com");
    expect(response.body.data.name).toBe("Test User");
    expect(response.body.message).toBe("Get current user success");
  });

  it("should logout user and invalidate token", async () => {
    const logoutRes = await request(app)
      .delete("/api/auth/logout")
      .set("Authorization", "test-token");

    expect(logoutRes.status).toBe(200);
    expect(logoutRes.body.data.email).toBe("testuser@example.com");
    expect(logoutRes.body.message).toBe("Logout successful");

    const meRes = await request(app)
      .get("/api/auth/me")
      .set("Authorization", "test-token");

    expect(meRes.status).toBe(401);
  });
});
