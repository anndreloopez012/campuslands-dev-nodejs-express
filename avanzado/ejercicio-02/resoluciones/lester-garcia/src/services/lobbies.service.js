import * as repo from "../repositories/lobbies.inMemory.repository.js";
import { AppError, BadRequestError, ConflictError, NotFoundError } from "../utils/customErrors.js";
export const toLobbyDTO = (lobby) => ({
  ...lobby,
  isFull: lobby.playersCount >= Number(process.env.MAX_LOBBY_PLAYERS || 10),
  tierLabel: lobby.averageMmr >= 2300 ? "Immortal_Radiant" : "Diamond_Ascendant"
});

export const listItemsService = async (filters = {}, deps = { repo }) => {
  let items = await deps.repo.findAll();
  if (filters.map) {
    items = items.filter((i) => i.map.toLowerCase() === String(filters.map).toLowerCase());
  }
  if (filters.status) {
    items = items.filter((i) => i.status.toUpperCase() === String(filters.status).toUpperCase());
  }
  return items.map(toLobbyDTO);
};

export const getItemByIdService = async (id, deps = { repo }) => {
  const item = await deps.repo.findById(id);
  if (!item) throw new NotFoundError(`El lobby competitivo '${id}' no existe.`);
  return toLobbyDTO(item);
};

export const createItemService = async (payload, deps = { repo }) => {
  if (!payload.code || !payload.map || payload.averageMmr === undefined) {
    throw new BadRequestError("Los campos 'code', 'map' y 'averageMmr' son obligatorios.");
  }
  const all = await deps.repo.findAll();
  if (all.some((i) => i.code.toLowerCase() === String(payload.code).toLowerCase())) {
    throw new ConflictError(`El código de sala '${payload.code}' ya está activo.`);
  }
  const created = await deps.repo.save({
    id: `LOB-0${all.length + 1}`,
    code: payload.code.trim().toUpperCase(),
    map: payload.map.trim(),
    mode: payload.mode || "Ranked_5v5",
    averageMmr: Number(payload.averageMmr),
    playersCount: Number(payload.playersCount ?? 2),
    status: "WAITING"
  });
  return toLobbyDTO(created);
};
