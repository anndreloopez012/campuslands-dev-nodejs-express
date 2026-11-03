import * as repo from "../repositories/commissions.inMemory.repository.js";
import { AppError, BadRequestError, ConflictError, NotFoundError } from "../utils/customErrors.js";
const idempotencyStore = new Map();

export const listItemsService = async () => ({
  storedIdempotencyKeys: Array.from(idempotencyStore.keys()),
  commissions: await repo.findAll()
});

export const getItemByIdService = async (id) => {
  const item = await repo.findById(id);
  if (!item) throw new NotFoundError(`La comisión de dibujo digital '${id}' no existe.`);
  return item;
};

export const createItemService = async (payload) => {
  const key = payload.idempotencyKey;
  if (!key || typeof key !== "string") {
    throw new BadRequestError("Se requiere 'idempotencyKey' (o cabecera 'Idempotency-Key') para procesar la comisión sin duplicados.");
  }
  if (idempotencyStore.has(key)) {
    return {
      idempotentReplay: true,
      idempotencyKey: key,
      commission: idempotencyStore.get(key)
    };
  }
  if (!payload.illustrator || !payload.client || !payload.priceUsd) {
    throw new BadRequestError("Se requiere 'illustrator', 'client' y 'priceUsd'.");
  }
  const all = await repo.findAll();
  const saved = await repo.save({
    id: `COM-0${all.length + 1}`,
    illustrator: payload.illustrator.trim(),
    client: payload.client.trim(),
    canvasResolution: payload.canvasResolution || "4K_300DPI",
    priceUsd: Number(payload.priceUsd)
  });
  idempotencyStore.set(key, saved);
  return {
    idempotentReplay: false,
    idempotencyKey: key,
    commission: saved
  };
};
