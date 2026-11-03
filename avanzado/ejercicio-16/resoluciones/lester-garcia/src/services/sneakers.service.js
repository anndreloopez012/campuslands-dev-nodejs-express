import * as repo from "../repositories/sneakers.inMemory.repository.js";
import { AppError, BadRequestError, ConflictError, NotFoundError } from "../utils/customErrors.js";
export const sanitizeText = (value = "") =>
  String(value)
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<[^>]+>/g, "")
    .trim();

export const listItemsService = async () => repo.findAll();

export const getItemByIdService = async (id) => {
  const item = await repo.findById(sanitizeText(id));
  if (!item) throw new NotFoundError(`El par de sneakers '${id}' no existe.`);
  return item;
};

export const createItemService = async (payload) => {
  const rawModel = payload?.model || "";
  const rawSku = payload?.sku || "";
  const cleanModel = sanitizeText(rawModel);
  const cleanSku = sanitizeText(rawSku).toUpperCase();

  if (!cleanSku || !cleanModel) {
    throw new BadRequestError("Los campos 'sku' y 'model' son obligatorios tras la sanitización.");
  }
  const all = await repo.findAll();
  return repo.save({
    id: `SNK-0${all.length + 1}`,
    sku: cleanSku,
    model: cleanModel,
    colorway: sanitizeText(payload.colorway || "Limited Edition"),
    retailUsd: Number(payload.retailUsd || 150),
    wasSanitized: cleanModel !== rawModel.trim()
  });
};
