import { matchesRepository } from "../repositories/matches.inMemory.repository.js";
import { anticheatClient } from "../utils/anticheatClient.js";
import { ForbiddenError, NotFoundError } from "../utils/customErrors.js";

export const getAllMatchesService = async (deps = { repo: matchesRepository }) => {
  return await deps.repo.findAll();
};

export const getMatchByIdService = async (id, deps = { repo: matchesRepository }) => {
  const match = await deps.repo.findById(id);
  if (!match) {
    throw new NotFoundError(`La partida competitiva con ID '${id}' no existe.`);
  }
  return match;
};

export const registerCompetitiveMatchService = async (
  payload,
  deps = { repo: matchesRepository, anticheat: anticheatClient }
) => {
  const verification = await deps.anticheat.verifyPlayerIntegrity(payload.playerTag);

  if (!verification.isClean) {
    throw new ForbiddenError(
      `El jugador '${payload.playerTag}' tiene bloqueo activo en Anticheat (TrustScore: ${verification.trustScore}).`
    );
  }

  const kills = Number(payload.kills);
  const deaths = Number(payload.deaths);
  const kdRatio = Number((deaths === 0 ? kills : kills / deaths).toFixed(2));

  const all = await deps.repo.findAll();
  const nextId = `MTC-${String(all.length + 1).padStart(2, "0")}`;

  const newMatch = {
    id: nextId,
    playerTag: payload.playerTag.trim(),
    mapName: payload.mapName.trim(),
    kills,
    deaths,
    kdRatio,
    headshotPercentage: Number(payload.headshotPercentage),
    anticheatTrustScore: verification.trustScore,
    createdAt: new Date().toISOString()
  };

  return await deps.repo.save(newMatch);
};
