import * as repo from "../repositories/tracks.inMemory.repository.js";
import { AppError, BadRequestError, ConflictError, NotFoundError } from "../utils/customErrors.js";
export const listItemsService = async () => repo.findAll();

export const getItemByIdService = async (id) => {
  const item = await repo.findById(id);
  if (!item) throw new NotFoundError(`El track musical '${id}' no existe.`);
  return item;
};

export const createItemService = async (payload) => {
  const batch = Array.isArray(payload.tracks) ? payload.tracks : [payload];
  if (batch.length === 0) {
    throw new BadRequestError("El lote de importación musical no puede estar vacío.");
  }
  const inserted = [];
  const rejected = [];

  for (const item of batch) {
    if (!item || !item.isrc || !item.title || !item.artist) {
      rejected.push({ item, reason: "Faltan campos obligatorios (isrc, title, artist)." });
      continue;
    }
    const current = await repo.findAll();
    if (current.some((t) => t.isrc.toUpperCase() === String(item.isrc).toUpperCase())) {
      rejected.push({ item, reason: `El código ISRC '${item.isrc}' ya está registrado.` });
      continue;
    }
    const saved = await repo.save({
      id: `TRK-0${current.length + 1}`,
      isrc: item.isrc.trim().toUpperCase(),
      title: item.title.trim(),
      artist: item.artist.trim(),
      bpm: Number(item.bpm || 120)
    });
    inserted.push(saved);
  }

  if (inserted.length === 0 && rejected.length > 0) {
    throw new BadRequestError("Ninguna pista del lote pudo importarse.", rejected);
  }

  return {
    summary: { totalProcessed: batch.length, insertedCount: inserted.length, rejectedCount: rejected.length },
    inserted,
    rejected
  };
};
