import * as tournamentsRepo from "../repositories/tournaments.inMemory.repository.js";
import { openApiSpecification } from "../config/openapi.config.js";
import { NotFoundError } from "../utils/customErrors.js";

export const getOpenApiDocsService = () => {
  return openApiSpecification;
};

export const getAllTournamentsService = async () => {
  return await tournamentsRepo.findAllTournaments();
};

export const getTournamentByIdService = async (id) => {
  const tournament = await tournamentsRepo.findTournamentById(id);
  if (!tournament) {
    throw new NotFoundError(`El torneo MOBA con ID '${id}' no fue encontrado.`);
  }
  return tournament;
};

export const createTournamentService = async (payload) => {
  const all = await tournamentsRepo.findAllTournaments();
  const nextId = `TRN-${String(all.length + 1).padStart(2, "0")}`;

  const newTournament = {
    id: nextId,
    name: payload.name.trim(),
    gameTitle: payload.gameTitle.trim(),
    region: payload.region.trim(),
    prizePoolUsd: Number(payload.prizePoolUsd),
    createdAt: new Date().toISOString()
  };

  return await tournamentsRepo.saveTournament(newTournament);
};
