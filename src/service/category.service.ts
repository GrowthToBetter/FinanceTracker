import categoryRepository from "../repository/category.repository.js";
import { ResponseError } from "../error/response.error.js";
import { validate } from "../validation/validation.js";
import {
  createCategoryValidation,
  updateCategoryValidation,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from "../validation/category.validation.js";

const create = async (request: CreateCategoryRequest) => {
  const data = validate(createCategoryValidation, request);

  const category = await categoryRepository.create(data.name);

  return {
    id: category.id,
    name: category.name,
    createdAt: category.createdAt,
  };
};

const list = async () => {
  const categories = await categoryRepository.findAll();

  return categories.map((category) => ({
    id: category.id,
    name: category.name,
    createdAt: category.createdAt,
  }));
};

const update = async (id: number, request: UpdateCategoryRequest) => {
  const data = validate(updateCategoryValidation, request);

  const existingCategory = await categoryRepository.findById(id);
  if (!existingCategory) {
    throw new ResponseError(404, "Category not found");
  }

  const updatedCategory = await categoryRepository.update(id, data.name);

  return {
    id: updatedCategory.id,
    name: updatedCategory.name,
  };
};

const deleteCategory = async (id: number) => {
  const existingCategory = await categoryRepository.findById(id);
  if (!existingCategory) {
    throw new ResponseError(404, "Category not found");
  }

  const { transactions, budgets } = await categoryRepository.countReferences(id);
  if (transactions > 0 || budgets > 0) {
    throw new ResponseError(400, "Cannot delete category that is in use");
  }

  await categoryRepository.deleteById(id);

  return {
    id,
  };
};

export default {
  create,
  list,
  update,
  deleteCategory,
};
