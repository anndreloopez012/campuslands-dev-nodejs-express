import {
  listItemsService,
  getItemByIdService,
  createItemService
} from "../services/raids.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const listItems = asyncHandler(async (req, res) => {
  const data = await listItemsService(req.query);
  res.status(200).json({
    ok: true,
    topic: "testing de integracion",
    theme: "videojuegos RPG",
    data
  });
});

export const getItemById = asyncHandler(async (req, res) => {
  const data = await getItemByIdService(req.params.id);
  res.status(200).json({
    ok: true,
    topic: "testing de integracion",
    data
  });
});

export const createItem = asyncHandler(async (req, res) => {
  const payload = {
    ...req.body,
    ...(req.headers["idempotency-key"] ? { idempotencyKey: req.headers["idempotency-key"] } : {})
  };
  const data = await createItemService(payload);
  res.status(201).json({
    ok: true,
    topic: "testing de integracion",
    message: "Operación procesada exitosamente.",
    data
  });
});
