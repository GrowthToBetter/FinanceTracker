import express from "express";
import dashboardController from "../controller/dashboard.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const dashboardRouter = express.Router();
dashboardRouter.use(authMiddleware);

/**
 * @openapi
 * /api/dashboard/summary:
 *   get:
 *     summary: Get cached dashboard summary for current user
 *     tags:
 *       - Dashboard
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: Get dashboard summary success
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DashboardSummaryResponse'
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
dashboardRouter.get("/api/dashboard/summary", dashboardController.getSummary);

/**
 * @openapi
 * /api/dashboard/cashflow:
 *   get:
 *     summary: Get cached daily cashflow trends for current user
 *     tags:
 *       - Dashboard
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: Get cashflow trends success
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DashboardCashflowResponse'
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
dashboardRouter.get("/api/dashboard/cashflow", dashboardController.getCashflow);

export { dashboardRouter };
