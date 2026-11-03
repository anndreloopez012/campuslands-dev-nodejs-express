import {
  listItemsService,
  getItemByIdService,
  createItemService
} from "../services/sneakers.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const listItems = asyncHandler(async (req, res) => {
  const data = await listItemsService(req.query);
  res.status(200).json({
    ok: true,
    topic: "sanitizacion de entrada",
    theme: "ropa y sneakers",
    data
  });
});

export const getItemById = asyncHandler(async (req, res) => {
  const data = await getItemByIdService(req.params.id);
  res.status(200).json({
    ok: true,
    topic: "sanitizacion de entrada",
    data
  });
});

export const createItem = asyncHandler(async (req, res) => {
  const payload = {
    ...req.body,
    ...(req.headers["idempotency-key"] ? { idempotencyKey: req.headers["idempotency-key"] } : {}),
    ...(req.headers["x-user-role"] ? { role: req.headers["x-user-role"] } : {})
  };
  const data = await createItemService(payload);
  res.status(201).json({
    ok: true,
    topic: "sanitizacion de entrada",
    message: "Operación procesada exitosamente.",
    data
  });
});
