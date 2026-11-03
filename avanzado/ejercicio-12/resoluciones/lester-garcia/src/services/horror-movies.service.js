import * as repo from "../repositories/horror-movies.inMemory.repository.js";
import { AppError, BadRequestError, ConflictError, NotFoundError } from "../utils/customErrors.js";
export const listItemsService = async (filters = {}) => {
  let items = await repo.findAll();
  if (filters.minRating) {
    items = items.filter((m) => m.scareRating >= Number(filters.minRating));
  }
  return {
    exportMeta: {
      exportedAt: new Date().toISOString(),
      format: "application/json",
      suggestedFilename: process.env.EXPORT_FILENAME || "horror-catalog-export.json",
      recordCount: items.length
    },
    records: items
  };
};

export const getItemByIdService = async (id) => {
  const item = await repo.findById(id);
  if (!item) throw new NotFoundError(`La película de terror '${id}' no existe en el catálogo.`);
  return item;
};

export const createItemService = async (payload) => {
  if (!payload.title || !payload.director || !payload.releaseYear) {
    throw new BadRequestError("Se requiere 'title', 'director' y 'releaseYear'.");
  }
  const all = await repo.findAll();
  return repo.save({
    id: `HOR-0${all.length + 1}`,
    title: payload.title.trim(),
    director: payload.director.trim(),
    releaseYear: Number(payload.releaseYear),
    subgenre: payload.subgenre || "Slasher_Paranormal",
    scareRating: Number(payload.scareRating || 8.0)
  });
};
