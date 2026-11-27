import { z } from "zod";

const isValidDateString = (val: string) => !isNaN(Date.parse(val));

const exportReportValidation = z.object({
  format: z.enum(["CSV", "JSON"]).default("CSV"),
  type: z.enum(["INCOME", "EXPENSE", "TRANSFER"]).optional(),
  status: z.enum(["POSTED", "VOIDED"]).optional(),
  walletId: z.coerce.number().int().positive().optional(),
  categoryId: z.coerce.number().int().positive().optional(),
  startDate: z
    .string()
    .refine(isValidDateString, { message: "Invalid startDate format" })
    .optional(),
  endDate: z
    .string()
    .refine(isValidDateString, { message: "Invalid endDate format" })
    .optional(),
});

export type ExportReportRequest = z.infer<typeof exportReportValidation>;

export { exportReportValidation };
