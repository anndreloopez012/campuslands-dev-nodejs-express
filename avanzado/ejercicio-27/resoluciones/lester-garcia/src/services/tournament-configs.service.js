import * as repo from "../repositories/tournament-configs.inMemory.repository.js";
import { AppError, BadRequestError, ConflictError, NotFoundError } from "../utils/customErrors.js";
const deepFreeze = (obj) => {
  Object.keys(obj).forEach((key) => {
    if (obj[key] && typeof obj[key] === "object") deepFreeze(obj[key]);
  });
  return Object.freeze(obj);
};

export const buildAdvancedConfig = (env = process.env) =>
  deepFreeze({
    environment: env.NODE_ENV || "development",
    server: {
      port: Number(env.PORT || 3000)
    },
    mobaEngine: {
      patchVersion: env.MOBA_PATCH_VERSION || "14.21",
      chronobreakEnabled: String(env.ENABLE_CHRONOBREAK ?? "true") === "true",
      maxPauseSeconds: Number(env.MAX_PAUSE_SECONDS || 900)
    }
  });

export const listItemsService = async () => ({
  activeImmutableConfig: buildAdvancedConfig(),
  profiles: await repo.findAll()
});

export const getItemByIdService = async (id) => {
  const item = await repo.findById(id);
  if (!item) throw new NotFoundError(`El perfil de torneo MOBA '${id}' no existe.`);
  return item;
};

export const createItemService = async (payload) => {
  if (!payload.tournamentName || !payload.patchVersion) {
    throw new BadRequestError("Se requiere 'tournamentName' y 'patchVersion'.");
  }
  const all = await repo.findAll();
  return repo.save({
    id: `CFG-0${all.length + 1}`,
    tournamentName: payload.tournamentName.trim(),
    patchVersion: payload.patchVersion.trim(),
    chronobreakEnabled: Boolean(payload.chronobreakEnabled ?? true),
    maxPauseSeconds: Number(payload.maxPauseSeconds || 900)
  });
};
