import * as repo from "../repositories/fights.inMemory.repository.js";
import { AppError, BadRequestError, ConflictError, NotFoundError } from "../utils/customErrors.js";
import { Readable } from "node:stream";

export const listItemsService = async () => {
  const fights = await repo.findAll();
  const chunks = [];
  const stream = Readable.from(fights.map((f) => JSON.stringify(f)));
  for await (const chunk of stream) {
    chunks.push(JSON.parse(chunk));
  }
  return { streamedChunks: chunks.length, fights: chunks };
};

export const getItemByIdService = async (id) => {
  const item = await repo.findById(id);
  if (!item) throw new NotFoundError(`El combate de kickboxing '${id}' no existe.`);
  return item;
};

export const createItemService = async (payload) => {
  if (!payload.fighterRed || !payload.fighterBlue || !payload.weightClass) {
    throw new BadRequestError("Se requiere 'fighterRed', 'fighterBlue' y 'weightClass'.");
  }
  const all = await repo.findAll();
  return repo.save({
    id: `FGT-0${all.length + 1}`,
    fighterRed: payload.fighterRed.trim(),
    fighterBlue: payload.fighterBlue.trim(),
    weightClass: payload.weightClass.trim(),
    rounds: Number(payload.rounds || 3),
    totalStrikes: Number(payload.totalStrikes || 120)
  });
};
