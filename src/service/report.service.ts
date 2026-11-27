import { v4 as uuid } from "uuid";
import reportRepository from "../repository/report.repository.js";
import notificationRepository from "../repository/notification.repository.js";
import { getCache, setCache } from "../web/redis.js";
import { logger } from "../web/logging.js";
import { ResponseError } from "../error/response.error.js";
import { validate } from "../validation/validation.js";
import {
  exportReportValidation,
  ExportReportRequest,
} from "../validation/report.validation.js";

const EXPORT_JOB_TTL_SECONDS = 600;

export interface ExportJobRecord {
  jobId: string;
  userId: number;
  format: "CSV" | "JSON";
  status: "PENDING" | "COMPLETED" | "FAILED";
  totalRecords: number;
  content: string | any[] | null;
  createdAt: string;
  completedAt: string | null;
}

export const getExportJobCacheKey = (userId: number, jobId: string): string =>
  `report:export:${userId}:${jobId}`;

const escapeCsvField = (value: string | number | null | undefined): string => {
  if (value === null || value === undefined) {
    return "";
  }
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

const processExportJob = async (
  userId: number,
  jobId: string,
  filters: ExportReportRequest,
  createdAt: string
): Promise<void> => {
  const cacheKey = getExportJobCacheKey(userId, jobId);
  try {
    const transactions = await reportRepository.findTransactionsForExport(
      userId,
      filters
    );

    const rows = transactions.map((t) => ({
      id: t.id,
      date: t.date.toISOString(),
      type: t.type,
      status: t.status,
      amount: Number(t.amount),
      fromWallet: t.fromWallet.name,
      toWallet: t.toWallet?.name ?? null,
      category: t.category?.name ?? null,
      note: t.note ?? null,
    }));

    let content: string | any[];
    if (filters.format === "CSV") {
      const header =
        "id,date,type,status,amount,fromWallet,toWallet,category,note";
      const lines = rows.map((r) =>
        [
          escapeCsvField(r.id),
          escapeCsvField(r.date),
          escapeCsvField(r.type),
          escapeCsvField(r.status),
          escapeCsvField(r.amount),
          escapeCsvField(r.fromWallet),
          escapeCsvField(r.toWallet),
          escapeCsvField(r.category),
          escapeCsvField(r.note),
        ].join(",")
      );
      content = [header, ...lines].join("\n");
    } else {
      content = rows;
    }

    const completedJob: ExportJobRecord = {
      jobId,
      userId,
      format: filters.format,
      status: "COMPLETED",
      totalRecords: rows.length,
      content,
      createdAt,
      completedAt: new Date().toISOString(),
    };

    await setCache(cacheKey, completedJob, EXPORT_JOB_TTL_SECONDS);
    await notificationRepository.create(
      userId,
      `Export report (${filters.format}) completed with ${rows.length} records`
    );
  } catch (err: any) {
    logger.error(`Failed to process export job ${jobId}: ${err.message}`);
    const failedJob: ExportJobRecord = {
      jobId,
      userId,
      format: filters.format,
      status: "FAILED",
      totalRecords: 0,
      content: null,
      createdAt,
      completedAt: new Date().toISOString(),
    };
    await setCache(cacheKey, failedJob, EXPORT_JOB_TTL_SECONDS);
  }
};

const requestExport = async (
  userId: number,
  request: ExportReportRequest
) => {
  const data = validate(exportReportValidation, request ?? {});
  const jobId = uuid().toString();
  const createdAt = new Date().toISOString();

  const initialJob: ExportJobRecord = {
    jobId,
    userId,
    format: data.format,
    status: "PENDING",
    totalRecords: 0,
    content: null,
    createdAt,
    completedAt: null,
  };

  const cacheKey = getExportJobCacheKey(userId, jobId);
  await setCache(cacheKey, initialJob, EXPORT_JOB_TTL_SECONDS);

  setImmediate(() => {
    processExportJob(userId, jobId, data, createdAt);
  });

  return {
    jobId,
    format: data.format,
    status: "PENDING",
    createdAt,
  };
};

const getExportJob = async (userId: number, jobId: string) => {
  const cacheKey = getExportJobCacheKey(userId, jobId);
  const job = await getCache<ExportJobRecord>(cacheKey);

  if (!job) {
    throw new ResponseError(404, "Export job not found");
  }

  return {
    jobId: job.jobId,
    format: job.format,
    status: job.status,
    totalRecords: job.totalRecords,
    content: job.content,
    createdAt: job.createdAt,
    completedAt: job.completedAt,
  };
};

export default {
  requestExport,
  getExportJob,
};
