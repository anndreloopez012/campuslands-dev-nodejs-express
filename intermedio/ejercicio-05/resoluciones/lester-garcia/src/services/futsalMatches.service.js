import * as matchRepository from "../repositories/futsalMatches.inMemory.repository.js";
import { NotFoundError, ConflictError, BadRequestError } from "../utils/customErrors.js";

const VALID_SURFACES = ["Parquet", "Sintético", "Pista Pulida", "Cemento"];
const VALID_STATUSES = ["Scheduled", "Live", "Finished", "Postponed"];

export const getAllMatchesService = async (filters = {}) => {
  let matches = await matchRepository.findAll();
  const { status, surface, team } = filters;

  if (status) {
    matches = matches.filter(
      (m) => m.status.toLowerCase() === status.toLowerCase()
    );
  }

  if (surface) {
    matches = matches.filter(
      (m) => m.surface.toLowerCase() === surface.toLowerCase()
    );
  }

  if (team) {
    matches = matches.filter(
      (m) =>
        m.homeTeam.toLowerCase().includes(team.toLowerCase()) ||
        m.awayTeam.toLowerCase().includes(team.toLowerCase())
    );
  }

  return matches;
};

export const getMatchByIdService = async (id) => {
  const match = await matchRepository.findById(id);
  if (!match) {
    throw new NotFoundError(`El encuentro con ID '${id}' no existe en el sistema.`);
  }
  return match;
};

export const createMatchService = async (payload) => {
  const { matchCode, tournament, homeTeam, awayTeam, homeGoals, awayGoals, surface, status } = payload;

  if (!matchCode || !tournament || !homeTeam || !awayTeam) {
    throw new BadRequestError("Los campos matchCode, tournament, homeTeam y awayTeam son obligatorios.");
  }

  if (surface && !VALID_SURFACES.includes(surface.trim())) {
    throw new BadRequestError(`Superficie inválida. Permitidas: ${VALID_SURFACES.join(", ")}.`);
  }

  if (status && !VALID_STATUSES.includes(status.trim())) {
    throw new BadRequestError(`Estado inválido. Permitidos: ${VALID_STATUSES.join(", ")}.`);
  }

  const existing = await matchRepository.findByCode(matchCode.trim());
  if (existing) {
    throw new ConflictError(`El código de encuentro '${matchCode}' ya se encuentra registrado.`);
  }

  const newMatch = {
    id: String(Date.now()),
    matchCode: matchCode.trim(),
    tournament: tournament.trim(),
    homeTeam: homeTeam.trim(),
    awayTeam: awayTeam.trim(),
    homeGoals: homeGoals !== undefined ? Number(homeGoals) : 0,
    awayGoals: awayGoals !== undefined ? Number(awayGoals) : 0,
    surface: surface ? surface.trim() : "Parquet",
    status: status ? status.trim() : "Scheduled"
  };

  return await matchRepository.save(newMatch);
};

export const updateMatchService = async (id, payload) => {
  const match = await matchRepository.findById(id);
  if (!match) {
    throw new NotFoundError(`No se puede actualizar. El partido con ID '${id}' no existe.`);
  }

  const { matchCode, tournament, homeTeam, awayTeam, homeGoals, awayGoals, surface, status } = payload;

  if (matchCode) {
    const existing = await matchRepository.findByCode(matchCode.trim());
    if (existing && existing.id !== String(id)) {
      throw new ConflictError(`El código '${matchCode}' ya está asignado a otro encuentro.`);
    }
  }

  if (surface && !VALID_SURFACES.includes(surface.trim())) {
    throw new BadRequestError(`Superficie inválida. Permitidas: ${VALID_SURFACES.join(", ")}.`);
  }

  if (status && !VALID_STATUSES.includes(status.trim())) {
    throw new BadRequestError(`Estado inválido. Permitidos: ${VALID_STATUSES.join(", ")}.`);
  }

  const updatedData = {
    matchCode: matchCode ? matchCode.trim() : match.matchCode,
    tournament: tournament ? tournament.trim() : match.tournament,
    homeTeam: homeTeam ? homeTeam.trim() : match.homeTeam,
    awayTeam: awayTeam ? awayTeam.trim() : match.awayTeam,
    homeGoals: homeGoals !== undefined ? Number(homeGoals) : match.homeGoals,
    awayGoals: awayGoals !== undefined ? Number(awayGoals) : match.awayGoals,
    surface: surface ? surface.trim() : match.surface,
    status: status ? status.trim() : match.status
  };

  return await matchRepository.update(id, updatedData);
};

export const deleteMatchService = async (id) => {
  const deleted = await matchRepository.remove(id);
  if (!deleted) {
    throw new NotFoundError(`No se puede eliminar. El partido con ID '${id}' no existe.`);
  }
};