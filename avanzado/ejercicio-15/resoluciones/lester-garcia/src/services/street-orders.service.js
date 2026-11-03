import * as repo from "../repositories/street-orders.inMemory.repository.js";
import { AppError, BadRequestError, ConflictError, NotFoundError } from "../utils/customErrors.js";
export const SECURITY_POLICIES = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "no-referrer",
  "Content-Security-Policy": "default-src 'none'; frame-ancestors 'none'",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains"
};

export const listItemsService = async () => {
  const orders = await repo.findAll();
  return { activeSecurityHeaders: SECURITY_POLICIES, orders };
};

export const getItemByIdService = async (id) => {
  const item = await repo.findById(id);
  if (!item) throw new NotFoundError(`El pedido urbano '${id}' no existe.`);
  return item;
};

export const createItemService = async (payload) => {
  if (!payload.truckName || !payload.dish || !payload.priceCop) {
    throw new BadRequestError("Se requiere 'truckName', 'dish' y 'priceCop'.");
  }
  const all = await repo.findAll();
  return repo.save({
    id: `ORD-0${all.length + 1}`,
    truckName: payload.truckName.trim(),
    dish: payload.dish.trim(),
    priceCop: Number(payload.priceCop),
    spicyLevel: payload.spicyLevel || "Medio"
  });
};
