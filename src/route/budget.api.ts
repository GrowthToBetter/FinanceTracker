import express from "express";
import budgetController from "../controller/budget.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const budgetRouter = express.Router();
budgetRouter.use(authMiddleware);

/**
 * @openapi
 * /api/budgets:
 *   post:
 *     summary: Create a monthly budget for a category
 *     tags:
 *       - Budget
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BudgetCreateRequest'
 *     responses:
 *       201:
 *         description: Create budget success
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BudgetResponse'
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
budgetRouter.post("/api/budgets", budgetController.create);

/**
 * @openapi
 * /api/budgets:
 *   get:
 *     summary: List all user budgets with spending progress
 *     tags:
 *       - Budget
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: Get budgets success
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BudgetListResponse'
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
budgetRouter.get("/api/budgets", budgetController.list);

/**
 * @openapi
 * /api/budgets/{id}:
 *   get:
 *     summary: Get budget detail by ID
 *     tags:
 *       - Budget
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
 *         description: Get budget detail success
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BudgetDetailResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse401'
 *       404:
 *         description: Budget not found
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
budgetRouter.get("/api/budgets/:id", budgetController.get);

/**
 * @openapi
 * /api/budgets/{id}:
 *   patch:
 *     summary: Update budget limit amount
 *     tags:
 *       - Budget
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
 *             $ref: '#/components/schemas/BudgetUpdateRequest'
 *     responses:
 *       200:
 *         description: Update budget success
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BudgetResponse'
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
 *         description: Budget not found
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
budgetRouter.patch("/api/budgets/:id", budgetController.update);

/**
 * @openapi
 * /api/budgets/{id}:
 *   delete:
 *     summary: Delete budget by ID
 *     tags:
 *       - Budget
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
 *         description: Delete budget success
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BudgetDeleteResponse'
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
 *         description: Budget not found
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
budgetRouter.delete("/api/budgets/:id", budgetController.deleteBudget);

export { budgetRouter };
