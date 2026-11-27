import express from "express";
import categoryController from "../controller/category.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const categoryRouter = express.Router();
categoryRouter.use(authMiddleware);

/**
 * @openapi
 * /api/categories:
 *   post:
 *     summary: Create a new category
 *     tags:
 *       - Category
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CategoryCreateRequest'
 *     responses:
 *       201:
 *         description: Create category success
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CategoryResponse'
 *       400:
 *         description: Bad Request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse400'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse401'
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse500'
 */
categoryRouter.post("/api/categories", categoryController.create);

/**
 * @openapi
 * /api/categories:
 *   get:
 *     summary: List all categories
 *     tags:
 *       - Category
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: Get categories success
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CategoryListResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse401'
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse500'
 */
categoryRouter.get("/api/categories", categoryController.list);

/**
 * @openapi
 * /api/categories/{id}:
 *   patch:
 *     summary: Update category by ID
 *     tags:
 *       - Category
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CategoryUpdateRequest'
 *     responses:
 *       200:
 *         description: Update category success
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CategoryUpdateResponse'
 *       400:
 *         description: Bad Request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse400'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse401'
 *       404:
 *         description: Category not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse404'
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse500'
 */
categoryRouter.patch("/api/categories/:id", categoryController.update);

/**
 * @openapi
 * /api/categories/{id}:
 *   delete:
 *     summary: Delete category by ID
 *     tags:
 *       - Category
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Delete category success
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CategoryDeleteResponse'
 *       400:
 *         description: Bad Request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse400'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse401'
 *       404:
 *         description: Category not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse404'
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse500'
 */
categoryRouter.delete("/api/categories/:id", categoryController.deleteCategory);

export { categoryRouter };
