import { Request, Response, NextFunction } from "express";
import walletService from "../service/wallet.service.js";
import { ResponseError } from "../error/response.error.js";

const parseWalletId = (idParam: string | string[] | undefined): number => {
  const rawId = Array.isArray(idParam) ? idParam[0] : idParam;
  const id = Number(rawId);
  if (!rawId || isNaN(id) || id <= 0) {
    throw new ResponseError(400, "Invalid wallet id");
  }
  return id;
};

const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await walletService.create(req.user!.id, req.body);
    res.status(201).json({
      status: 201,
      data: result,
      message: "Create wallet success",
    });
  } catch (error) {
    next(error);
  }
};

const list = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await walletService.list(req.user!.id);
    res.status(200).json({
      status: 200,
      data: result,
      message: "Get wallets success",
    });
  } catch (error) {
    next(error);
  }
};

const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const walletId = parseWalletId(req.params.id);
    const result = await walletService.get(req.user!.id, walletId);
    res.status(200).json({
      status: 200,
      data: result,
      message: "Get wallet detail success",
    });
  } catch (error) {
    next(error);
  }
};

const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const walletId = parseWalletId(req.params.id);
    const result = await walletService.update(req.user!.id, walletId, req.body);
    res.status(200).json({
      status: 200,
      data: result,
      message: "Update wallet success",
    });
  } catch (error) {
    next(error);
  }
};

const deleteWallet = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const walletId = parseWalletId(req.params.id);
    const result = await walletService.deleteWallet(req.user!.id, walletId);
    res.status(200).json({
      status: 200,
      data: result,
      message: "Delete wallet success",
    });
  } catch (error) {
    next(error);
  }
};

export default {
  create,
  list,
  get,
  update,
  deleteWallet,
};
