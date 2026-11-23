import { prismaClient } from "../web/database.js";
import { User } from "@prisma/client";

const findByEmail = async (email: string): Promise<User | null> => {
  return prismaClient.user.findUnique({
    where: { email },
  });
};

const findById = async (id: number): Promise<User | null> => {
  return prismaClient.user.findUnique({
    where: { id },
  });
};

const findByToken = async (token: string): Promise<User | null> => {
  return prismaClient.user.findUnique({
    where: { token },
  });
};

const create = async (data: {
  name: string;
  email: string;
  password: string;
}): Promise<User> => {
  return prismaClient.user.create({
    data,
  });
};

const updateToken = async (
  id: number,
  token: string | null
): Promise<User> => {
  return prismaClient.user.update({
    where: { id },
    data: { token },
  });
};

export default {
  findByEmail,
  findById,
  findByToken,
  create,
  updateToken,
};
