import { z } from "zod";

const registerUserValidation = z.object({
  name: z.string().min(1, "Name is required").max(255),
  email: z.string().email("Invalid email format").max(255),
  password: z.string().min(6, "Password must be at least 6 characters").max(255),
});

const loginUserValidation = z.object({
  email: z.string().email("Invalid email format").max(255),
  password: z.string().min(1, "Password is required"),
});

export type RegisterUserRequest = z.infer<typeof registerUserValidation>;
export type LoginUserRequest = z.infer<typeof loginUserValidation>;

export { registerUserValidation, loginUserValidation };
