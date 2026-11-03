import * as repo from "../repositories/books.inMemory.repository.js";
import { AppError, BadRequestError, ConflictError, NotFoundError } from "../utils/customErrors.js";
const appMetrics = {
  readsTotal: 0,
  writesTotal: 0,
  validationErrorsTotal: 0,
  startedAt: Date.now()
};

export const listItemsService = async () => {
  appMetrics.readsTotal += 1;
  const books = await repo.findAll();
  return {
    metrics: {
      ...appMetrics,
      uptimeSeconds: Math.round((Date.now() - appMetrics.startedAt) / 1000),
      heapUsedMb: Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 100) / 100
    },
    books
  };
};

export const getItemByIdService = async (id) => {
  appMetrics.readsTotal += 1;
  const item = await repo.findById(id);
  if (!item) throw new NotFoundError(`El libro '${id}' no existe en la colección.`);
  return item;
};

export const createItemService = async (payload) => {
  if (!payload.title || !payload.author) {
    appMetrics.validationErrorsTotal += 1;
    throw new BadRequestError("Los campos 'title' y 'author' son obligatorios.");
  }
  appMetrics.writesTotal += 1;
  const all = await repo.findAll();
  return repo.save({
    id: `BOK-0${all.length + 1}`,
    title: payload.title.trim(),
    author: payload.author.trim(),
    pages: Number(payload.pages || 250),
    genre: payload.genre || "Literatura Universal"
  });
};
