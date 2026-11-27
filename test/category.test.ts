import { describe, it, expect, beforeEach, afterEach } from "@jest/globals";
import request from "supertest";
import { app } from "../src/web/main.js";
import {
  createTestUser,
  removeTestUser,
  createTestCategory,
  removeTestCategory,
} from "./util-test.js";

describe("Category API", () => {
  beforeEach(async () => {
    await createTestUser();
  });

  afterEach(async () => {
    await removeTestCategory("Test Category");
    await removeTestCategory("Updated Category");
    await removeTestCategory("Food & Beverage");
    await removeTestUser();
  });

  describe("POST /api/categories", () => {
    it("should create category successfully", async () => {
      const response = await request(app)
        .post("/api/categories")
        .set("Authorization", "test-token")
        .send({
          name: "Food & Beverage",
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("data");
      expect(response.body.data).toHaveProperty("id");
      expect(response.body.data).toHaveProperty("name", "Food & Beverage");
      expect(response.body.data).toHaveProperty("createdAt");
      expect(response.body.message).toBe("Create category success");
    });

    it("should reject creation when name is empty", async () => {
      const response = await request(app)
        .post("/api/categories")
        .set("Authorization", "test-token")
        .send({
          name: "",
        });

      expect(response.status).toBe(400);
      expect(response.body.data).toBeNull();
    });

    it("should reject creation without auth token", async () => {
      const response = await request(app)
        .post("/api/categories")
        .send({
          name: "Food & Beverage",
        });

      expect(response.status).toBe(401);
      expect(response.body.data).toBeNull();
    });
  });

  describe("GET /api/categories", () => {
    it("should list categories successfully", async () => {
      const category = await createTestCategory("Test Category");

      const response = await request(app)
        .get("/api/categories")
        .set("Authorization", "test-token");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("data");
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThanOrEqual(1);

      const found = response.body.data.find((c: any) => c.id === category.id);
      expect(found).toBeDefined();
      expect(found.name).toBe("Test Category");
      expect(response.body.message).toBe("Get categories success");
    });

    it("should reject listing without auth token", async () => {
      const response = await request(app).get("/api/categories");

      expect(response.status).toBe(401);
      expect(response.body.data).toBeNull();
    });
  });

  describe("PATCH /api/categories/:id", () => {
    it("should update category successfully", async () => {
      const category = await createTestCategory("Test Category");

      const response = await request(app)
        .patch(`/api/categories/${category.id}`)
        .set("Authorization", "test-token")
        .send({
          name: "Updated Category",
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("data");
      expect(response.body.data.id).toBe(category.id);
      expect(response.body.data.name).toBe("Updated Category");
      expect(response.body.message).toBe("Update category success");
    });

    it("should reject update when category not found", async () => {
      const response = await request(app)
        .patch("/api/categories/999999")
        .set("Authorization", "test-token")
        .send({
          name: "Updated Category",
        });

      expect(response.status).toBe(404);
      expect(response.body.data).toBeNull();
      expect(response.body.message).toBe("Category not found");
    });

    it("should reject update with empty name", async () => {
      const category = await createTestCategory("Test Category");

      const response = await request(app)
        .patch(`/api/categories/${category.id}`)
        .set("Authorization", "test-token")
        .send({
          name: "",
        });

      expect(response.status).toBe(400);
      expect(response.body.data).toBeNull();
    });

    it("should reject update with invalid id", async () => {
      const response = await request(app)
        .patch("/api/categories/invalid")
        .set("Authorization", "test-token")
        .send({
          name: "Updated Category",
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Invalid category id");
    });

    it("should reject update without auth token", async () => {
      const category = await createTestCategory("Test Category");

      const response = await request(app)
        .patch(`/api/categories/${category.id}`)
        .send({
          name: "Updated Category",
        });

      expect(response.status).toBe(401);
      expect(response.body.data).toBeNull();
    });
  });

  describe("DELETE /api/categories/:id", () => {
    it("should delete category successfully", async () => {
      const category = await createTestCategory("Test Category");

      const response = await request(app)
        .delete(`/api/categories/${category.id}`)
        .set("Authorization", "test-token");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("data");
      expect(response.body.data.id).toBe(category.id);
      expect(response.body.message).toBe("Delete category success");
    });

    it("should reject deletion when category not found", async () => {
      const response = await request(app)
        .delete("/api/categories/999999")
        .set("Authorization", "test-token");

      expect(response.status).toBe(404);
      expect(response.body.data).toBeNull();
      expect(response.body.message).toBe("Category not found");
    });

    it("should reject deletion with invalid id", async () => {
      const response = await request(app)
        .delete("/api/categories/invalid")
        .set("Authorization", "test-token");

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Invalid category id");
    });

    it("should reject deletion without auth token", async () => {
      const category = await createTestCategory("Test Category");

      const response = await request(app).delete(`/api/categories/${category.id}`);

      expect(response.status).toBe(401);
      expect(response.body.data).toBeNull();
    });
  });
});
