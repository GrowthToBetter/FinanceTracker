import { Request, Response, NextFunction } from "express";
import categoryService from "../service/category.service.js";
import { ResponseError } from "../error/response.error.js";

const parseCategoryId = (idParam: string | string[] | undefined): number => {
  const rawId = Array.isArray(idParam) ? idParam[0] : idParam;
  const id = Number(rawId);
  if (!rawId || isNaN(id) || id <= 0) {
    throw new ResponseError(400, "Invalid category id");
  }
  return id;
};

const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await categoryService.create(req.body);
    res.status(201).json({
      status: 201,
      data: result,
      message: "Create category success",
    });
  } catch (error) {
    next(error);
  }
};

const list = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await categoryService.list();
    res.status(200).json({
      status: 200,
      data: result,
      message: "Get categories success",
    });
  } catch (error) {
    next(error);
  }
};

const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const categoryId = parseCategoryId(req.params.id);
    const result = await categoryService.update(categoryId, req.body);
    res.status(200).json({
      status: 200,
      data: result,
      message: "Update category success",
    });
  } catch (error) {
    next(error);
  }
};

const deleteCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const categoryId = parseCategoryId(req.params.id);
    const result = await categoryService.deleteCategory(categoryId);
    res.status(200).json({
      status: 200,
      data: result,
      message: "Delete category success",
    });
  } catch (error) {
    next(error);
  }
};

export default {
  create,
  list,
  update,
  deleteCategory,
};
