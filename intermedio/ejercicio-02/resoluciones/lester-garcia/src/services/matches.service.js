import * as matchesRepo from "../repositories/matches.repository.js";
import { NotFoundError, ConflictError } from "../utils/customErrors.js";

export const getAllMatchesService = async (filters = {}) => {
  let matches = await matchesRepo.findAllMatches();
  const { gameMode, isLive } = filters;

  if (gameMode) {
    matches = matches.filter(
      (m) => m.gameMode.toLowerCase() === gameMode.toLowerCase()
    );
  }

  if (isLive !== undefined) {
    const liveBool = isLive === "true";
    matches = matches.filter((m) => m.isLive === liveBool);
  }

  return matches;
};

export const getMatchByIdService = async (id) => {
  const match = await matchesRepo.findMatchById(id);
  if (!match) {
    throw new NotFoundError(`La partida con ID '${id}' no existe.`);
  }
  return match;
};

export const createMatchService = async (data) => {
  const all = await matchesRepo.findAllMatches();
  const exists = all.some((m) => m.matchCode.toLowerCase() === data.matchCode.toLowerCase());

  if (exists) {
    throw new ConflictError(`El código de partida '${data.matchCode}' ya está registrado.`);
  }

  const newMatch = {
    id: String(Date.now()),
    ...data,
    isLive: data.isLive !== undefined ? Boolean(data.isLive) : false
  };

  return await matchesRepo.saveMatch(newMatch);
};