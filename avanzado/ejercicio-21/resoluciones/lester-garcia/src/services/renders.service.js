import * as repo from "../repositories/renders.inMemory.repository.js";
import { AppError, BadRequestError, ConflictError, NotFoundError } from "../utils/customErrors.js";
const getActiveSlots = (items) => items.filter((r) => r.status === "ACTIVE_GPU_SLOT").length;

export const listItemsService = async () => {
  const items = await repo.findAll();
  const maxSlots = Number(process.env.MAX_CONCURRENT_RENDERS || 2);
  const activeSlots = getActiveSlots(items);
  return {
    concurrencyPool: { maxSlots, activeSlots, availableSlots: Math.max(0, maxSlots - activeSlots) },
    renders: items
  };
};

export const getItemByIdService = async (id) => {
  const item = await repo.findById(id);
  if (!item) throw new NotFoundError(`El nodo de render 3D '${id}' no existe.`);
  return item;
};

export const createItemService = async (payload) => {
  if (!payload.sceneName || !payload.engine) {
    throw new BadRequestError("Se requiere 'sceneName' y 'engine' (Cycles, Arnold, Redshift).");
  }
  const all = await repo.findAll();
  const maxSlots = Number(process.env.MAX_CONCURRENT_RENDERS || 2);
  const activeSlots = getActiveSlots(all);

  if (activeSlots >= maxSlots) {
    throw new ConflictError(
      `Límite de concurrencia GPU alcanzado (${activeSlots}/${maxSlots} renders activos). Libera un nodo antes de iniciar otra escena.`
    );
  }

  return repo.save({
    id: `RND-0${all.length + 1}`,
    sceneName: payload.sceneName.trim(),
    engine: payload.engine.trim(),
    frames: Number(payload.frames || 100),
    status: payload.status || "ACTIVE_GPU_SLOT"
  });
};
