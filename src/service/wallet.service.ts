import walletRepository from "../repository/wallet.repository.js";
import { invalidateDashboardCache } from "../web/redis.js";
import { ResponseError } from "../error/response.error.js";
import { validate } from "../validation/validation.js";
import {
  createWalletValidation,
  updateWalletValidation,
  CreateWalletRequest,
  UpdateWalletRequest,
} from "../validation/wallet.validation.js";

const create = async (userId: number, request: CreateWalletRequest) => {
  const data = validate(createWalletValidation, request);

  const initialBalance = BigInt(data.balance ?? 0);

  const wallet = await walletRepository.create({
    userId,
    name: data.name,
    type: data.type,
    balance: initialBalance,
  });

  await invalidateDashboardCache(userId);

  return wallet;
};

const list = async (userId: number) => {
  const wallets = await walletRepository.findAllByUserId(userId);

  return wallets.map((wallet) => ({
    id: wallet.id,
    name: wallet.name,
    type: wallet.type,
    balance: wallet.balance,
    createdAt: wallet.createdAt,
  }));
};

const get = async (userId: number, walletId: number) => {
  const wallet = await walletRepository.findByIdAndUserId(walletId, userId);
  if (!wallet) {
    throw new ResponseError(404, "Wallet not found");
  }

  return wallet;
};

const update = async (
  userId: number,
  walletId: number,
  request: UpdateWalletRequest
) => {
  const data = validate(updateWalletValidation, request);

  const existingWallet = await walletRepository.findByIdAndUserId(walletId, userId);
  if (!existingWallet) {
    throw new ResponseError(404, "Wallet not found");
  }

  const updatedWallet = await walletRepository.update(walletId, userId, data);
  await invalidateDashboardCache(userId);
  return updatedWallet;
};

const deleteWallet = async (userId: number, walletId: number) => {
  const existingWallet = await walletRepository.findByIdAndUserId(walletId, userId);
  if (!existingWallet) {
    throw new ResponseError(404, "Wallet not found");
  }

  if (existingWallet.balance !== 0n) {
    throw new ResponseError(400, "Cannot delete wallet with non-zero balance");
  }

  await walletRepository.deleteById(walletId);
  await invalidateDashboardCache(userId);

  return {
    id: walletId,
  };
};

export default {
  create,
  list,
  get,
  update,
  deleteWallet,
};
