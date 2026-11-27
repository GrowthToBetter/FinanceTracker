import express from "express";
import reportController from "../controller/report.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const reportRouter = express.Router();
reportRouter.use(authMiddleware);

/**
 * @openapi
 * /api/reports/export:
 *   post:
 *     summary: Queue an asynchronous transaction report export (CSV or JSON)
 *     tags:
 *       - Report
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ReportExportRequest'
 *     responses:
 *       202:
 *         description: Export report job queued
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReportExportQueuedResponse'
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
reportRouter.post("/api/reports/export", reportController.requestExport);

/**
 * @openapi
 * /api/reports/export/{jobId}:
 *   get:
 *     summary: Get status and generated content of an asynchronous export job
 *     tags:
 *       - Report
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Get export report success
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReportExportDetailResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse401'
 *       404:
 *         description: Export job not found
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
reportRouter.get("/api/reports/export/:jobId", reportController.getExportJob);

export { reportRouter };
