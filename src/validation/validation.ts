import { ZodSchema } from "zod";
import { ResponseError } from "../error/response.error.js";

const validate = <T>(schema: ZodSchema<T>, data: unknown): T => {
  const result = schema.safeParse(data);
  if (!result.success) {
    const message = result.error.issues.map((issue) => issue.message).join(", ");
    throw new ResponseError(400, message);
  }
  return result.data;
};

export { validate };
