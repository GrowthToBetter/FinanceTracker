import express from "express";
import savingsGoalController from "../controller/savings-goal.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const savingsGoalRouter = express.Router();
savingsGoalRouter.use(authMiddleware);

/**
 * @openapi
 * /api/savings-goals:
 *   post:
 *     summary: Create a new savings goal
 *     tags:
 *       - SavingsGoal
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SavingsGoalCreateRequest'
 *     responses:
 *       201:
 *         description: Create savings goal success
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SavingsGoalResponse'
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
 *         description: Wallet not found
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
savingsGoalRouter.post("/api/savings-goals", savingsGoalController.create);

/**
 * @openapi
 * /api/savings-goals:
 *   get:
 *     summary: List all user savings goals with progress metrics
 *     tags:
 *       - SavingsGoal
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: Get savings goals success
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SavingsGoalListResponse'
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
savingsGoalRouter.get("/api/savings-goals", savingsGoalController.list);

/**
 * @openapi
 * /api/savings-goals/{id}:
 *   get:
 *     summary: Get savings goal detail by ID
 *     tags:
 *       - SavingsGoal
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
 *         description: Get savings goal detail success
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SavingsGoalResponse'
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
 *         description: Savings goal not found
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
savingsGoalRouter.get("/api/savings-goals/:id", savingsGoalController.get);

/**
 * @openapi
 * /api/savings-goals/{id}:
 *   patch:
 *     summary: Update savings goal by ID
 *     tags:
 *       - SavingsGoal
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
 *             $ref: '#/components/schemas/SavingsGoalUpdateRequest'
 *     responses:
 *       200:
 *         description: Update savings goal success
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SavingsGoalResponse'
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
 *         description: Savings goal not found
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
savingsGoalRouter.patch("/api/savings-goals/:id", savingsGoalController.update);

/**
 * @openapi
 * /api/savings-goals/{id}:
 *   delete:
 *     summary: Delete savings goal by ID
 *     tags:
 *       - SavingsGoal
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
 *         description: Delete savings goal success
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SavingsGoalDeleteResponse'
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
 *         description: Savings goal not found
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
savingsGoalRouter.delete(
  "/api/savings-goals/:id",
  savingsGoalController.deleteSavingsGoal
);

export { savingsGoalRouter };
