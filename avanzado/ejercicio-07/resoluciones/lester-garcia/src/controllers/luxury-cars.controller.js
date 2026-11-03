import {
  listItemsService,
  getItemByIdService,
  createItemService
} from "../services/luxury-cars.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const listItems = asyncHandler(async (req, res) => {
  const data = await listItemsService(req.query);
  res.status(200).json({
    ok: true,
    topic: "cache en memoria",
    theme: "autos de lujo",
    data
  });
});

export const getItemById = asyncHandler(async (req, res) => {
  const data = await getItemByIdService(req.params.id);
  res.status(200).json({
    ok: true,
    topic: "cache en memoria",
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
    topic: "cache en memoria",
    message: "Operación procesada exitosamente.",
    data
  });
});
