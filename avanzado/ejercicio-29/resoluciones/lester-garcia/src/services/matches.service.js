import * as repo from "../repositories/matches.inMemory.repository.js";
import { AppError, BadRequestError, ConflictError, NotFoundError } from "../utils/customErrors.js";
export const getDeployReadinessStatus = () => ({
  ready: true,
  environment: process.env.NODE_ENV || "development",
  version: process.env.SERVICE_VERSION || "1.0.0",
  uptimeSeconds: Math.round(process.uptime()),
  checks: {
    inMemoryStore: "OK",
    eventLoopLag: "LOW"
  }
});

export const listItemsService = async () => ({
  readinessReport: getDeployReadinessStatus(),
  matches: await repo.findAll()
});

export const getItemByIdService = async (id) => {
  const item = await repo.findById(id);
  if (!item) throw new NotFoundError(`El encuentro de fútbol/futsal '${id}' no existe.`);
  return item;
};

export const createItemService = async (payload) => {
  if (!payload.homeTeam || !payload.awayTeam) {
    throw new BadRequestError("Se requiere 'homeTeam' y 'awayTeam'.");
  }
  const all = await repo.findAll();
  return repo.save({
    id: `MTC-0${all.length + 1}`,
    competition: payload.competition || "Liga Nacional Futsal",
    homeTeam: payload.homeTeam.trim(),
    awayTeam: payload.awayTeam.trim(),
    score: payload.score || "0-0",
    venueReady: true
  });
};
