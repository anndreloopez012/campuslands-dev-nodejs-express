import {
  getAllApparelService,
  getApparelByIdService,
  createApparelService
} from "../services/apparel.service.js";
import { BadRequestError } from "../utils/customErrors.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getApparelController = asyncHandler(async (req, res) => {
  const items = await getAllApparelService();
  return res.status(200).json({
    status: "success",
    total: items.length,
    data: items
  });
});

export const getApparelByIdController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const item = await getApparelByIdService(id);

  return res.status(200).json({
    status: "success",
    data: item
  });
});

export const createApparelController = asyncHandler(async (req, res) => {
  const { name, brand, category, size, price, inStock } = req.body;

  if (!name || typeof name !== "string" || name.trim() === "") {
    throw new BadRequestError("El campo 'name' es obligatorio y debe ser un texto válido.");
  }

  if (!brand || typeof brand !== "string" || brand.trim() === "") {
    throw new BadRequestError("El campo 'brand' es obligatorio.");
  }

  if (!category || typeof category !== "string" || category.trim() === "") {
    throw new BadRequestError("El campo 'category' es obligatorio.");
  }

  if (size === undefined || size === null || String(size).trim() === "") {
    throw new BadRequestError("El campo 'size' (talla) es obligatorio.");
  }

  const numericPrice = Number(price);
  if (price === undefined || isNaN(numericPrice) || numericPrice <= 0) {
    throw new BadRequestError("El campo 'price' debe ser un número positivo mayor a 0.");
  }

  const newItem = await createApparelService({
    name: name.trim(),
    brand: brand.trim(),
    category: category.trim(),
    size,
    price: numericPrice,
    inStock
  });

  return res.status(201).json({
    status: "success",
    data: newItem
  });
});