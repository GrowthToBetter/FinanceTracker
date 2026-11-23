import bcrypt from "bcrypt";
import { v4 as uuid } from "uuid";
import userRepository from "../repository/user.repository.js";
import { ResponseError } from "../error/response.error.js";
import { validate } from "../validation/validation.js";
import {
  registerUserValidation,
  loginUserValidation,
  RegisterUserRequest,
  LoginUserRequest,
} from "../validation/user.validation.js";

const register = async (request: RegisterUserRequest) => {
  const data = validate(registerUserValidation, request);

  const existingUser = await userRepository.findByEmail(data.email);
  if (existingUser) {
    throw new ResponseError(400, "User with this email already exists");
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);
  const createdUser = await userRepository.create({
    name: data.name,
    email: data.email,
    password: hashedPassword,
  });

  return {
    id: createdUser.id,
    name: createdUser.name,
    email: createdUser.email,
    createdAt: createdUser.createdAt,
  };
};

const login = async (request: LoginUserRequest) => {
  const data = validate(loginUserValidation, request);

  const user = await userRepository.findByEmail(data.email);
  if (!user) {
    throw new ResponseError(401, "Email or password wrong");
  }

  const isPasswordValid = await bcrypt.compare(data.password, user.password);
  if (!isPasswordValid) {
    throw new ResponseError(401, "Email or password wrong");
  }

  const token = uuid().toString();
  await userRepository.updateToken(user.id, token);

  return {
    token,
  };
};

export default {
  register,
  login,
};
