import * as repo from "../repositories/raids.inMemory.repository.js";
import { AppError, BadRequestError, ConflictError, NotFoundError } from "../utils/customErrors.js";
export const listItemsService = async () => repo.findAll();

export const getItemByIdService = async (id) => {
  const item = await repo.findById(id);
  if (!item) throw new NotFoundError(`La raid RPG '${id}' no existe.`);
  return item;
};

export const createItemService = async (payload) => {
  if (!payload.dungeon || !payload.boss || payload.minGearScore === undefined) {
    throw new BadRequestError("Se requiere 'dungeon', 'boss' y 'minGearScore'.");
  }
  const all = await repo.findAll();
  return repo.save({
    id: `RAID-0${all.length + 1}`,
    dungeon: payload.dungeon.trim(),
    boss: payload.boss.trim(),
    minGearScore: Number(payload.minGearScore),
    difficulty: payload.difficulty || "Mythic_20"
  });
};
