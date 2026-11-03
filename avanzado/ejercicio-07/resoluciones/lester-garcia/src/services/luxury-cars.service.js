import * as repo from "../repositories/luxury-cars.inMemory.repository.js";
import { AppError, BadRequestError, ConflictError, NotFoundError } from "../utils/customErrors.js";
const memoryCache = {
  data: null,
  expiresAt: 0,
  hits: 0,
  misses: 0
};

export const listItemsService = async () => {
  const now = Date.now();
  const ttl = Number(process.env.CACHE_TTL_MS || 30000);
  if (memoryCache.data && now < memoryCache.expiresAt) {
    memoryCache.hits += 1;
    return { cacheStatus: "HIT", stats: { hits: memoryCache.hits, misses: memoryCache.misses }, items: memoryCache.data };
  }
  memoryCache.misses += 1;
  const items = await repo.findAll();
  memoryCache.data = items;
  memoryCache.expiresAt = now + ttl;
  return { cacheStatus: "MISS", stats: { hits: memoryCache.hits, misses: memoryCache.misses }, items };
};

export const getItemByIdService = async (id) => {
  const item = await repo.findById(id);
  if (!item) throw new NotFoundError(`El auto de lujo '${id}' no existe.`);
  return item;
};

export const createItemService = async (payload) => {
  if (!payload.brand || !payload.model || !payload.priceUsd) {
    throw new BadRequestError("Los campos 'brand', 'model' y 'priceUsd' son obligatorios.");
  }
  const all = await repo.findAll();
  const saved = await repo.save({
    id: `LUX-0${all.length + 1}`,
    brand: payload.brand.trim(),
    model: payload.model.trim(),
    priceUsd: Number(payload.priceUsd),
    bespokeInterior: payload.bespokeInterior || "Cuero Artesanal"
  });
  // Invalidación de caché tras mutación
  memoryCache.data = null;
  memoryCache.expiresAt = 0;
  return saved;
};
