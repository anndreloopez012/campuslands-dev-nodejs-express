import * as repo from "../repositories/arenas.inMemory.repository.js";
import { AppError, BadRequestError, ConflictError, NotFoundError } from "../utils/customErrors.js";
export const listItemsService = async () => ({
  architectureInfo: {
    appModule: "src/app.js (Puro pipeline HTTP importable por suites de test sin abrir sockets)",
    serverModule: "src/server.js (Responsable exclusivo de app.listen y señales SIGINT/SIGTERM)"
  },
  arenas: await repo.findAll()
});

export const getItemByIdService = async (id) => {
  const item = await repo.findById(id);
  if (!item) throw new NotFoundError(`La arena Battle Royale '${id}' no existe.`);
  return item;
};

export const createItemService = async (payload) => {
  if (!payload.mapName || payload.maxPlayers === undefined) {
    throw new BadRequestError("Se requiere 'mapName' y 'maxPlayers'.");
  }
  const all = await repo.findAll();
  return repo.save({
    id: `ARN-0${all.length + 1}`,
    mapName: payload.mapName.trim(),
    maxPlayers: Number(payload.maxPlayers),
    deploymentPlaneReady: Boolean(payload.deploymentPlaneReady ?? true)
  });
};
