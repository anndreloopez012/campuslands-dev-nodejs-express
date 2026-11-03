import * as repo from "../repositories/missions.inMemory.repository.js";
import { AppError, BadRequestError, ConflictError, NotFoundError } from "../utils/customErrors.js";
const structuredLogs = [];

export const recordStructuredLog = (level, event, context = {}) => {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    service: "scifi-fleet-telemetry",
    event,
    ...context
  };
  structuredLogs.push(entry);
  return entry;
};

export const listItemsService = async () => {
  const missions = await repo.findAll();
  recordStructuredLog("INFO", "FLEET_MISSIONS_QUERIED", { totalMissions: missions.length });
  return { missions, observabilityLogs: structuredLogs.slice(-10) };
};

export const getItemByIdService = async (id) => {
  const item = await repo.findById(id);
  if (!item) {
    recordStructuredLog("WARN", "MISSION_NOT_FOUND", { requestedId: id });
    throw new NotFoundError(`La misión interestelar '${id}' no existe.`);
  }
  return item;
};

export const createItemService = async (payload) => {
  if (!payload.starship || !payload.sector) {
    recordStructuredLog("ERROR", "MISSION_VALIDATION_FAILED", { payload });
    throw new BadRequestError("Se requiere 'starship' y 'sector' para autorizar el salto hiperespacial.");
  }
  const all = await repo.findAll();
  const saved = await repo.save({
    id: `MSN-0${all.length + 1}`,
    starship: payload.starship.trim(),
    sector: payload.sector.trim(),
    warpFactor: Number(payload.warpFactor || 5.0),
    status: "LAUNCHED"
  });
  recordStructuredLog("INFO", "MISSION_CREATED", { missionId: saved.id, starship: saved.starship });
  return saved;
};
